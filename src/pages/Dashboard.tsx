import { useState, useEffect, useCallback } from "react";
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
  const [summary, setSummary] = useState<Summary>(() => {
    // Tentar recuperar dados do localStorage
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

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    () => {
      // Tentar recuperar dados do localStorage
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

  const loadDashboardData = useCallback(
    async (isRetry = false) => {
      console.log("Iniciando loadDashboardData");
      try {
        if (!isRetry) {
          setLoading(true);
        }
        setError(null);

        // Verificar se o usuário está logado
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("Resultado getSession:", session, sessionError);

        if (sessionError) {
          throw new Error("Erro de autenticação: " + sessionError.message);
        }

        if (!session?.user) {
          setLoading(false);
          setError("Sessão expirada. Faça login novamente.");
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }

        // Carregar dados com timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        );

        const dataPromise = supabase
          .from("transactions")
          .select(
            `
          id,
          amount,
          description,
          date,
          type,
          payment_method,
          category:categories(name, color, icon)
        `
          )
          .eq("user_id", session.user.id)
          .gte("date", new Date(currentYear, currentMonth - 1, 1).toISOString())
          .lte("date", new Date(currentYear, currentMonth, 0).toISOString())
          .order("date", { ascending: false })
          .limit(5);

        const response = await Promise.race([dataPromise, timeoutPromise]);
        const { data: transactions, error: transactionsError } =
          response as any;

        if (transactionsError) {
          throw new Error(
            "Erro ao carregar transações: " + transactionsError.message
          );
        }

        const allTransactions = transactions || [];

        // Calcular resumo
        const totalIncome = allTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = allTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Calcular top categorias
        const categoryMap = new Map<
          string,
          { amount: number; count: number }
        >();
        allTransactions.forEach((transaction) => {
          const categoryName =
            (transaction.category as any)?.name || "Sem categoria";
          const current = categoryMap.get(categoryName) || {
            amount: 0,
            count: 0,
          };
          categoryMap.set(categoryName, {
            amount: current.amount + transaction.amount,
            count: current.count + 1,
          });
        });

        const topCategories = Array.from(categoryMap.entries())
          .map(([category, data]) => ({ category, ...data }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        const newSummary = {
          totalIncome,
          totalExpenses,
          balance,
          transactionCount: allTransactions.length,
          topCategories,
        };

        // Converter transações
        const newTransactions: Transaction[] = allTransactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          description: t.description || "",
          date: t.date,
          type: t.type,
          category_name: (t.category as any)?.name || "Sem categoria",
          category_color: (t.category as any)?.color || "#6B7280",
          category_icon: (t.category as any)?.icon || "📝",
          payment_method: t.payment_method,
        }));

        // Atualizar estados e persistir dados
        setSummary(newSummary);
        setRecentTransactions(newTransactions);
        persistData(newSummary, newTransactions);
        setRetryCount(0); // Resetar contagem de tentativas após sucesso
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);

        // Se ainda não atingiu o limite de tentativas, tentar novamente
        if (!isRetry && retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          console.log(`Tentativa ${retryCount + 1} de ${MAX_RETRIES}...`);
          setTimeout(() => loadDashboardData(true), 2000 * (retryCount + 1));
          return;
        }

        // Mostrar erro apropriado após todas as tentativas
        if (error.message?.includes("Timeout")) {
          setError(
            "Conexão lenta. Os últimos dados salvos estão sendo exibidos."
          );
          toast.error(
            "Problemas de conexão. Dados podem estar desatualizados."
          );
        } else if (error.message?.includes("não autenticado")) {
          setError("Sessão expirada. Faça login novamente.");
          toast.error("Sessão expirada. Faça login novamente.");
        } else {
          setError("Erro ao atualizar dados. Mostrando últimos dados salvos.");
          toast.error("Erro ao atualizar dados. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
        console.log("Finalizou loadDashboardData");
      }
    },
    [currentMonth, currentYear, persistData, retryCount]
  );

  useEffect(() => {
    let isMounted = true;

    // Função para verificar conectividade
    const checkConnectivity = () => {
      if (!navigator.onLine) {
        toast.error("Sem conexão com a internet. Mostrando dados salvos.");
        return false;
      }
      return true;
    };

    // Carregar dados iniciais
    if (checkConnectivity()) {
      loadDashboardData();
    }

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      toast.success("Conexão restaurada! Atualizando dados...");
      if (isMounted) loadDashboardData();
    };

    const handleOffline = () => {
      toast.error("Conexão perdida. Usando dados salvos localmente.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
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
