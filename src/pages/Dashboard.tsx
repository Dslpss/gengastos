import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { apiService, type UserSettings } from "../lib/supabaseApi";
import { useEventBus, EVENTS } from "../lib/eventBus";
import { useNotifications } from "../hooks/useNotifications";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category?: {
    name: string;
    color: string;
    icon: string;
  };
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
  const { on } = useEventBus();
  const { checkAllSmartNotifications } = useNotifications();

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
      const newSummary: Summary = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: initialBalance,
        transactionCount: transactions?.length || 0,
        topCategories: [],
      };

      const categoryMap = new Map<string, { amount: number; count: number }>();

      transactions?.forEach((transaction: any) => {
        if (transaction.type === "income") {
          newSummary.totalIncome += transaction.amount;
          newSummary.balance += transaction.amount;
        } else {
          newSummary.totalExpenses += transaction.amount;
          newSummary.balance -= transaction.amount;
        }

        // Acumular totais por categoria
        const categoryKey = transaction.category?.name || "Sem categoria";
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, { amount: 0, count: 0 });
        }
        const category = categoryMap.get(categoryKey)!;
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

  // Listener para recarregar dashboard quando transações/configurações mudarem
  useEffect(() => {
    const unsubscribeTransactions = on(EVENTS.DASHBOARD_REFRESH, () => {
      console.log("Recarregando dashboard devido a mudança em transações");
      loadDashboardData();
    });

    const unsubscribeSettings = on(EVENTS.USER_SETTINGS_UPDATED, () => {
      console.log("Recarregando dashboard devido a mudança em configurações");
      loadUserSettings();
      loadDashboardData();
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeSettings();
    };
  }, [on, loadDashboardData, loadUserSettings]);

  // Verificar notificações inteligentes após carregar dados
  useEffect(() => {
    const checkSmartNotifications = async () => {
      // Só verificar se temos dados carregados
      if (!loading && !salaryLoading && userSettings) {
        console.log(
          "🔍 Verificando notificações inteligentes baseadas no banco..."
        );

        // Verificar TODAS as notificações baseadas no banco de dados
        const alertCount = await checkAllSmartNotifications();

        if (alertCount > 0) {
          toast.success(
            `${alertCount} notificação(ões) importante(s) detectada(s)!`
          );
        } else {
          console.log("✅ Nenhuma notificação pendente");
        }
      }
    };

    checkSmartNotifications();
  }, [loading, salaryLoading, userSettings, checkAllSmartNotifications]);

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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-xl mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <span className="mr-3 text-4xl">📊</span>
                Dashboard Financeiro
              </h1>
              <p className="text-blue-100 text-lg">
                Bem-vindo ao seu centro de controle financeiro
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8 pb-8">
        {/* Resumo de Saldos */}
        {userSettings &&
          (userSettings.total_extra_balance > 0 || userSettings.salary > 0) && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                <span className="mr-3 text-2xl">💰</span>
                Resumo dos Saldos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl mb-2">💵</div>
                  <p className="text-gray-600 text-sm font-medium">
                    Salário Base
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    R$ {userSettings.salary.toFixed(2)}
                  </p>
                </div>
                {userSettings.bonus_balance > 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200 hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl mb-2">🎁</div>
                    <p className="text-yellow-700 text-sm font-medium">
                      Bonificações
                    </p>
                    <p className="font-bold text-yellow-800 text-lg">
                      R$ {userSettings.bonus_balance.toFixed(2)}
                    </p>
                  </div>
                )}
                {userSettings.investment_balance > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-green-700 text-sm font-medium">
                      Investimentos
                    </p>
                    <p className="font-bold text-green-800 text-lg">
                      R$ {userSettings.investment_balance.toFixed(2)}
                    </p>
                  </div>
                )}
                {userSettings.sales_balance > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl mb-2">💼</div>
                    <p className="text-blue-700 text-sm font-medium">Vendas</p>
                    <p className="font-bold text-blue-800 text-lg">
                      R$ {userSettings.sales_balance.toFixed(2)}
                    </p>
                  </div>
                )}
                {userSettings.other_balance > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200 hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-purple-700 text-sm font-medium">
                      Outros
                    </p>
                    <p className="font-bold text-purple-800 text-lg">
                      R$ {userSettings.other_balance.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center border-2 border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-indigo-700 text-sm font-medium">
                    Total Inicial
                  </p>
                  <p className="font-bold text-indigo-900 text-xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Saldo Total
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {summary.balance.toFixed(2)}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: summary.balance > 0 ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                <DollarSign className="text-green-600 w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium uppercase tracking-wide">
                  Receitas
                </p>
                <h3 className="text-3xl font-bold text-green-700 mt-2">
                  R$ {summary.totalIncome.toFixed(2)}
                </h3>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <span className="mr-1">↗️</span>
                  Este mês
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                <TrendingUp className="text-green-600 w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium uppercase tracking-wide">
                  Despesas
                </p>
                <h3 className="text-3xl font-bold text-red-700 mt-2">
                  R$ {summary.totalExpenses.toFixed(2)}
                </h3>
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">↘️</span>
                  Este mês
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl">
                <TrendingDown className="text-red-600 w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">
                  Transações
                </p>
                <h3 className="text-3xl font-bold text-blue-700 mt-2">
                  {summary.transactionCount}
                </h3>
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <span className="mr-1">📊</span>
                  Total
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl">
                <Activity className="text-blue-600 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 text-2xl">🕒</span>
              Transações Recentes
            </h3>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-blue-700">
                Últimas {recentTransactions.length}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">
                  Nenhuma transação encontrada
                </p>
                <p className="text-gray-400 mt-2">
                  Comece criando sua primeira transação!
                </p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-white shadow-lg"
                      style={{
                        backgroundColor:
                          transaction.category?.color || "#CBD5E0",
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {transaction.category?.name || "Sem categoria"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold text-xl ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"} R$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <div
                      className={`text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type === "income" ? "RECEITA" : "DESPESA"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
