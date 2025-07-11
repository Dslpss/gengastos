import { useState, useEffect } from "react";
import {
  apiService,
  type Transaction,
  type Category,
} from "../lib/supabaseApi";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Eye,
  Target,
  Activity,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import CashFlowForecast from "../components/CashFlowForecast";
import toast from "react-hot-toast";

interface CategoryReport {
  category: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  type: "all" | "income" | "expense";
  category_id: string;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "category" | "monthly" | "trends"
  >("category");

  // Filtros de relatório
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    type: "all",
    category_id: "",
  });

  // Estados dos dados processados
  const [categoryReport, setCategoryReport] = useState<CategoryReport[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias");
      }
    };
    loadInitialData();
  }, []);

  // Carregar transações com base nos filtros
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);

        // Calcular quantos meses estão no período
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const monthsDiff =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth()) +
          1;

        let allTransactions: Transaction[] = [];

        // Buscar transações para cada mês no período
        for (let i = 0; i < monthsDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setMonth(startDate.getMonth() + i);

          const params = {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            category_id: filters.category_id || undefined,
          };

          try {
            const { transactions: monthTransactions } =
              await apiService.getTransactions(params);
            allTransactions = [...allTransactions, ...monthTransactions];
          } catch (error) {
            console.warn(
              `Erro ao carregar transações para ${
                currentDate.getMonth() + 1
              }/${currentDate.getFullYear()}:`,
              error
            );
          }
        }

        // Filtrar por tipo e data
        let filteredTransactions = allTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          const matchesDateRange =
            transactionDate >= new Date(filters.startDate) &&
            transactionDate <= new Date(filters.endDate);

          const matchesType =
            filters.type === "all" || transaction.type === filters.type;

          return matchesDateRange && matchesType;
        });

        setTransactions(filteredTransactions);
        processReportData(filteredTransactions);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
        toast.error("Erro ao carregar dados do relatório");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [filters]);

  // Processar dados para os relatórios
  const processReportData = (transactionData: Transaction[]) => {
    // Calcular totais
    const income = transactionData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactionData
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setTotalBalance(income - expenses);

    // Processar relatório por categoria
    const categoryMap = new Map<
      string,
      { amount: number; count: number; icon: string; color: string }
    >();

    transactionData.forEach((transaction) => {
      const category = transaction.category as any;
      const categoryName = category?.name || "Sem categoria";
      const categoryIcon = category?.icon || "📋";
      const categoryColor = category?.color || "#9CA3AF";

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          amount: 0,
          count: 0,
          icon: categoryIcon,
          color: categoryColor,
        });
      }

      const categoryData = categoryMap.get(categoryName)!;
      categoryData.amount += transaction.amount;
      categoryData.count += 1;
    });

    const totalAmount = transactionData.reduce((sum, t) => sum + t.amount, 0);

    const categoryReportData: CategoryReport[] = Array.from(
      categoryMap.entries()
    )
      .map(([category, data]) => ({
        category,
        icon: data.icon,
        color: data.color,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    setCategoryReport(categoryReportData);

    // Processar relatório mensal
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    transactionData.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      if (transaction.type === "income") {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }
    });

    const monthlyReportData: MonthlyReport[] = Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-");
        const monthName = new Date(
          parseInt(year),
          parseInt(month) - 1
        ).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });

        return {
          month: monthName,
          income: data.income,
          expenses: data.expenses,
          balance: data.income - data.expenses,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    setMonthlyReport(monthlyReportData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const exportReport = () => {
    // Implementação básica de exportação
    const reportData = {
      period: `${filters.startDate} a ${filters.endDate}`,
      summary: {
        totalIncome,
        totalExpenses,
        totalBalance,
        transactionCount: transactions.length,
      },
      categoryReport,
      monthlyReport,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-financeiro-${filters.startDate}-${filters.endDate}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Relatório exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600 animate-pulse">
            Processando seus relatórios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    📊 Relatórios Financeiros
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Análise detalhada das suas finanças
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={exportReport}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Exportar Relatório
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg text-white">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">
                🗓️ Período de Análise
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value as any })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                >
                  <option value="all">🔄 Todos</option>
                  <option value="income">💚 Receitas</option>
                  <option value="expense">❤️ Despesas</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                >
                  <option value="">🏷️ Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">
                    💚 Total Receitas
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-red-50 to-rose-100 border border-red-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-red-700">
                    ❤️ Total Despesas
                  </p>
                </div>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`group border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              totalBalance >= 0
                ? "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/50"
                : "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-5 h-5 ${
                      totalBalance >= 0 ? "text-blue-600" : "text-orange-600"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      totalBalance >= 0 ? "text-blue-700" : "text-orange-700"
                    }`}
                  >
                    {totalBalance >= 0 ? "💙" : "🧡"} Saldo Líquido
                  </p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    totalBalance >= 0 ? "text-blue-800" : "text-orange-800"
                  }`}
                >
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-700">
                    💜 Transações
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de Visualização */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedView("category")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedView === "category"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <PieChart className="w-5 h-5" />
              Por Categoria
            </button>
            <button
              onClick={() => setSelectedView("monthly")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedView === "monthly"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Por Período
            </button>
            <button
              onClick={() => setSelectedView("trends")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedView === "trends"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Tendências
            </button>
          </div>
        </div>

        {/* Conteúdo dos Relatórios */}
        {selectedView === "category" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                📊 Relatório por Categoria
              </h3>
            </div>
            <div className="p-6">
              {categoryReport.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl">📊</div>
                  <p className="text-gray-500">
                    Nenhum dado encontrado para o período selecionado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryReport.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.count} transações
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.percentage.toFixed(1)}% do total
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === "monthly" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                📈 Relatório Mensal
              </h3>
            </div>
            <div className="p-6">
              {monthlyReport.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl">📈</div>
                  <p className="text-gray-500">
                    Nenhum dado encontrado para o período selecionado
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Período
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Receitas
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Despesas
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Saldo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReport.map((month, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {month.month}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">
                            {formatCurrency(month.income)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-semibold">
                            {formatCurrency(month.expenses)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-semibold ${
                              month.balance >= 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}
                          >
                            {formatCurrency(month.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === "trends" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                📊 Análise de Tendências
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200/50">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    💙 Média de Receitas
                  </h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(
                      monthlyReport.length > 0
                        ? totalIncome / monthlyReport.length
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Por período analisado
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-6 border border-red-200/50">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ❤️ Média de Despesas
                  </h4>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(
                      monthlyReport.length > 0
                        ? totalExpenses / monthlyReport.length
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Por período analisado
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200/50">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    💚 Categoria Mais Usada
                  </h4>
                  <p className="text-xl font-bold text-green-900">
                    {categoryReport[0]?.category || "N/A"}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {categoryReport[0]
                      ? `${categoryReport[0].count} transações`
                      : "Sem dados"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200/50">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    💜 Taxa de Economia
                  </h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {totalIncome > 0
                      ? ((totalBalance / totalIncome) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p className="text-sm text-purple-700 mt-2">
                    {totalBalance >= 0
                      ? "Poupando dinheiro"
                      : "Gastando mais que ganha"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Previsão de Fluxo de Caixa */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">
                🔮 Previsão de Fluxo de Caixa
              </h3>
            </div>
          </div>

          <div className="p-6">
            <CashFlowForecast className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
