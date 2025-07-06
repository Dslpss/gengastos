import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { apiService, type UserSettings } from "../lib/supabaseApi";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category_name: string;
  category_color: string;
  category_icon: string;
  payment_method: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  topCategories: Array<{ category: string; amount: number; count: number }>;
}

export default function Dashboard() {
  // Estados
  const [summary, setSummary] = useState<Summary>(() => {
    const savedSummary = localStorage.getItem("dashboard_summary");
    return savedSummary
      ? JSON.parse(savedSummary)
      : {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          transactionCount: 0,
          topCategories: [],
        };
  });

  // Salário/Saldo Inicial
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(true);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    () => {
      const savedTransactions = localStorage.getItem("recent_transactions");
      return savedTransactions ? JSON.parse(savedTransactions) : [];
    }
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Função para salvar dados no localStorage
  const persistData = useCallback(
    (newSummary: Summary, newTransactions: Transaction[]) => {
      try {
        localStorage.setItem("dashboard_summary", JSON.stringify(newSummary));
        localStorage.setItem(
          "recent_transactions",
          JSON.stringify(newTransactions)
        );
      } catch (error) {
        console.warn("Erro ao persistir dados localmente:", error);
      }
    },
    []
  );

  const loadUserSettings = useCallback(async () => {
    try {
      setSalaryLoading(true);
      let settings = await apiService.getUserSettings();

      if (!settings) {
        console.log(
          "Configurações não encontradas, criando configurações padrão"
        );
        // Tentar criar configurações padrão
        settings = await apiService.upsertUserSettings(0);

        if (!settings) {
          console.log(
            "Não foi possível criar configurações, usando valores padrão"
          );
          setUserSettings({
            salary: 0,
            bonus_balance: 0,
            investment_balance: 0,
            sales_balance: 0,
            other_balance: 0,
            total_extra_balance: 0,
            id: "",
            user_id: "",
            created_at: "",
            updated_at: "",
          });
        } else {
          setUserSettings(settings);
        }
      } else {
        setUserSettings(settings);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações do usuário:", err);

      // Verificar se é erro de tabela não encontrada
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes("user_settings") &&
        errorMessage.includes("does not exist")
      ) {
        toast.error(
          "Tabela de configurações não encontrada. Verifique a configuração do banco de dados."
        );
      } else {
        toast.error("Erro ao carregar salário inicial. Usando valor padrão.");
      }

      setUserSettings({
        salary: 0,
        bonus_balance: 0,
        investment_balance: 0,
        sales_balance: 0,
        other_balance: 0,
        total_extra_balance: 0,
        id: "",
        user_id: "",
        created_at: "",
        updated_at: "",
      });
    } finally {
      setSalaryLoading(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select(
          `
          *,
          category:categories(name, color, icon)
        `
        )
        .gte(
          "date",
          `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`
        )
        .lte(
          "date",
          `${currentYear}-${currentMonth.toString().padStart(2, "0")}-31`
        );

      if (transactionsError) throw transactionsError;

      // Calcular resumo
      const initialBalance =
        (userSettings?.salary || 0) + (userSettings?.total_extra_balance || 0);
      const newSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: initialBalance,
        transactionCount: transactions?.length || 0,
        topCategories: [],
      };

      const categoryMap = new Map();

      transactions?.forEach((transaction: Transaction) => {
        if (transaction.type === "income") {
          newSummary.totalIncome += transaction.amount;
          newSummary.balance += transaction.amount;
        } else {
          newSummary.totalExpenses += transaction.amount;
          newSummary.balance -= transaction.amount;
        }

        // Acumular totais por categoria
        const categoryKey = transaction.category_name;
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, { amount: 0, count: 0 });
        }
        const category = categoryMap.get(categoryKey);
        category.amount += transaction.amount;
        category.count += 1;
      });

      // Converter mapa de categorias para array e ordenar
      newSummary.topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setSummary(newSummary);
      localStorage.setItem("dashboard_summary", JSON.stringify(newSummary));

      // Atualizar transações recentes
      const recentOnes =
        transactions
          ?.sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5) || [];

      setRecentTransactions(recentOnes);
      localStorage.setItem("recent_transactions", JSON.stringify(recentOnes));
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Erro ao carregar dados do dashboard");
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          loadDashboardData();
        }, Math.pow(2, retryCount) * 1000);
      }
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, retryCount, userSettings]);

  // Efeito para carregar dados
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Dinheiro",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "PIX",
      transfer: "Transferência",
    };
    return methods[method] || method;
  };

  if (loading || salaryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {error.includes("conexão") ? "📡" : "⚠️"}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.includes("conexão")
              ? "Problemas de Conexão"
              : "Ops! Algo deu errado"}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-gray-500">
              Status: {navigator.onLine ? "🟢 Online" : "🔴 Offline"}
            </p>
            <button
              onClick={() => {
                if (navigator.onLine) {
                  loadDashboardData();
                } else {
                  toast.error("Sem conexão com a internet");
                }
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Resumo de Saldos */}
      {userSettings &&
        (userSettings.total_extra_balance > 0 || userSettings.salary > 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              💰 Resumo dos Saldos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Salário Base</p>
                <p className="font-semibold text-gray-900">
                  R$ {userSettings.salary.toFixed(2)}
                </p>
              </div>
              {userSettings.bonus_balance > 0 && (
                <div className="text-center">
                  <p className="text-gray-600">Bonificações</p>
                  <p className="font-semibold text-yellow-600">
                    R$ {userSettings.bonus_balance.toFixed(2)}
                  </p>
                </div>
              )}
              {userSettings.investment_balance > 0 && (
                <div className="text-center">
                  <p className="text-gray-600">Investimentos</p>
                  <p className="font-semibold text-green-600">
                    R$ {userSettings.investment_balance.toFixed(2)}
                  </p>
                </div>
              )}
              {userSettings.sales_balance > 0 && (
                <div className="text-center">
                  <p className="text-gray-600">Vendas</p>
                  <p className="font-semibold text-blue-600">
                    R$ {userSettings.sales_balance.toFixed(2)}
                  </p>
                </div>
              )}
              {userSettings.other_balance > 0 && (
                <div className="text-center">
                  <p className="text-gray-600">Outros</p>
                  <p className="font-semibold text-purple-600">
                    R$ {userSettings.other_balance.toFixed(2)}
                  </p>
                </div>
              )}
              <div className="text-center border-l border-gray-300 pl-3">
                <p className="text-gray-600">Total Inicial</p>
                <p className="font-bold text-lg text-gray-900">
                  R${" "}
                  {(
                    (userSettings.salary || 0) +
                    (userSettings.total_extra_balance || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Saldo Total</p>
              <h3 className="text-2xl font-semibold">
                R$ {summary.balance.toFixed(2)}
              </h3>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Receitas</p>
              <h3 className="text-2xl font-semibold text-green-500">
                R$ {summary.totalIncome.toFixed(2)}
              </h3>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Despesas</p>
              <h3 className="text-2xl font-semibold text-red-500">
                R$ {summary.totalExpenses.toFixed(2)}
              </h3>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Transações</p>
              <h3 className="text-2xl font-semibold">
                {summary.transactionCount}
              </h3>
            </div>
            <Activity className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
        <div className="space-y-2">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: transaction.category_color || "#CBD5E0",
                  }}
                />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.category_name} •{" "}
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"} R${" "}
                {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhuma transação encontrada
            </p>
          )}
        </div>
      </div>

      {/* Top Categorias */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Top Categorias</h3>
        <div className="space-y-2">
          {summary.topCategories.map((category) => (
            <div
              key={category.category}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <div>
                <p className="font-medium">{category.category}</p>
                <p className="text-sm text-gray-500">
                  {category.count} transações
                </p>
              </div>
              <span className="font-semibold">
                R$ {category.amount.toFixed(2)}
              </span>
            </div>
          ))}
          {summary.topCategories.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhuma categoria encontrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
