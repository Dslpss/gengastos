import { useState, useEffect } from "react";
import { apiService } from "../lib/supabaseApi";
import { supabase } from "../lib/supabase";
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
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    topCategories: [],
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadDashboardData();

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Timeout de carregamento atingido");
        setError("Tempo limite excedido. Tente novamente.");
        setLoading(false);
      }
    }, 15000); // 15 segundos

    return () => clearTimeout(timeout);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Iniciando carregamento do dashboard...");

      // Verificar se o usuário está logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        setError("Usuário não autenticado");
        toast.error("Você precisa fazer login para acessar o dashboard");
        setLoading(false);
        return;
      }

      console.log("✅ Usuário autenticado:", user.email);

      // Carregar resumo do mês atual
      console.log("📊 Carregando resumo financeiro...");
      const summaryData = await apiService.getDashboardSummary(
        currentMonth,
        currentYear
      );
      console.log("✅ Resumo carregado:", summaryData);
      setSummary(summaryData);

      // Carregar transações recentes
      console.log("💰 Carregando transações...");
      const transactionsData = await apiService.getTransactions({
        limit: 5,
        month: currentMonth,
        year: currentYear,
      });
      console.log("✅ Transações carregadas:", transactionsData);

      // Converter transações para o formato esperado
      const convertedTransactions: Transaction[] =
        transactionsData.transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          description: t.description || "",
          date: t.date,
          type: t.type,
          category_name: t.category?.name || "Sem categoria",
          category_color: t.category?.color || "#6B7280",
          category_icon: t.category?.icon || "📝",
          payment_method: t.payment_method,
        }));

      setRecentTransactions(convertedTransactions);
      console.log("🎉 Dashboard carregado com sucesso!");
    } catch (error: any) {
      console.error("❌ Erro ao carregar dados:", error);
      console.error("Detalhes do erro:", error.message, error.stack);

      // Verificar tipo de erro
      if (error.message?.includes("não autenticado")) {
        setError("Sessão expirada. Faça login novamente.");
        toast.error("Sessão expirada. Faça login novamente.");
      } else if (error.message?.includes("fetch")) {
        setError("Erro de conexão. Verifique sua internet.");
        toast.error("Erro de conexão. Verifique sua internet.");
      } else {
        setError("Erro ao carregar dados do dashboard.");
        toast.error("Erro ao carregar dados do dashboard. Tente novamente.");
      }
    } finally {
      setLoading(false);
      console.log("✅ Loading finalizado");
    }
  };

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

  if (loading) {
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
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              console.log("🔄 Tentando recarregar...");
              loadDashboardData();
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Receitas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(summary.totalIncome)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Despesas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(summary.totalExpenses)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign
                  className={`h-8 w-8 ${
                    summary.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Saldo
                  </dt>
                  <dd
                    className={`text-lg font-semibold ${
                      summary.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transações
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {summary.transactionCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Transações Recentes
            </h3>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma transação encontrada</p>
                <p className="text-sm text-gray-400 mt-2">
                  Comece adicionando suas primeiras transações.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: `${transaction.category_color}20`,
                        color: transaction.category_color,
                      }}
                    >
                      {transaction.category_icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description || transaction.category_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category_name} •{" "}
                        {getPaymentMethodName(transaction.payment_method)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Categorias */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Principais Categorias
            </h3>
          </div>
          <div className="p-6">
            {summary.topCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma categoria encontrada</p>
                <p className="text-sm text-gray-400 mt-2">
                  As categorias aparecerão aqui quando você adicionar
                  transações.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.topCategories.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.count} transações
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
