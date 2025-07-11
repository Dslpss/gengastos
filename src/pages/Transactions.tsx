import { useState, useEffect, useCallback } from "react";
import {
  apiService,
  type Transaction,
  type Category,
} from "../lib/supabaseApi";
import { useEventBus, EVENTS } from "../lib/eventBus";
import TransactionForm from "../components/TransactionForm";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const { emit } = useEventBus();

  // Filtros e paginação
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: "" as "" | "income" | "expense",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    loadCategories();
  }, []);

  // Carregar transações
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        month: filters.month,
        year: filters.year,
        category_id: filters.category_id || undefined,
      };

      const { transactions: data, total } = await apiService.getTransactions(
        params
      );

      // Filtrar por busca e tipo se necessário
      let filteredData = data;

      if (filters.search) {
        filteredData = filteredData.filter(
          (t) =>
            t.description
              ?.toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            (t.category as any)?.name
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      if (filters.type) {
        filteredData = filteredData.filter((t) => t.type === filters.type);
      }

      setTransactions(filteredData);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }

    try {
      await apiService.deleteTransaction(id);
      toast.success("Transação excluída com sucesso!");
      emit(EVENTS.TRANSACTION_DELETED, { id });
      emit(EVENTS.DASHBOARD_REFRESH);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
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
      cash: "💵 Dinheiro",
      credit_card: "💳 Cartão de Crédito",
      debit_card: "💳 Cartão de Débito",
      pix: "📱 PIX",
      transfer: "🏦 Transferência",
    };
    return methods[method] || method;
  };

  const getCategoryName = (transaction: Transaction) => {
    if (transaction.category) {
      const category = transaction.category as any;
      return `${category.icon} ${category.name}`;
    }
    return "Sem categoria";
  };

  // Calcular totais do período atual
  const currentMonthIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    💳 Transações
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(0, filters.month - 1).toLocaleDateString(
                      "pt-BR",
                      { month: "long" }
                    )}{" "}
                    {filters.year} •
                    <span className="font-semibold text-blue-600">
                      {totalCount} transações
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateTransaction}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Resumo do Período - Cards Modernos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receitas */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-lg text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-green-700">
                    💚 Receitas
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(currentMonthIncome)}
                </p>
                <p className="text-xs text-green-600">
                  {transactions.filter((t) => t.type === "income").length}{" "}
                  transações
                </p>
              </div>
              <div className="text-green-500/20 group-hover:text-green-500/30 transition-colors">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Despesas */}
          <div className="group bg-gradient-to-br from-red-50 to-rose-100 border border-red-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-500 rounded-lg text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-red-700">
                    ❤️ Despesas
                  </p>
                </div>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(currentMonthExpenses)}
                </p>
                <p className="text-xs text-red-600">
                  {transactions.filter((t) => t.type === "expense").length}{" "}
                  transações
                </p>
              </div>
              <div className="text-red-500/20 group-hover:text-red-500/30 transition-colors">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Saldo */}
          <div
            className={`group border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              currentMonthBalance >= 0
                ? "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/50"
                : "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg text-white ${
                      currentMonthBalance >= 0 ? "bg-blue-500" : "bg-orange-500"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      currentMonthBalance >= 0
                        ? "text-blue-700"
                        : "text-orange-700"
                    }`}
                  >
                    {currentMonthBalance >= 0 ? "💙" : "🧡"} Saldo do Período
                  </p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    currentMonthBalance >= 0
                      ? "text-blue-800"
                      : "text-orange-800"
                  }`}
                >
                  {formatCurrency(currentMonthBalance)}
                </p>
                <p
                  className={`text-xs ${
                    currentMonthBalance >= 0
                      ? "text-blue-600"
                      : "text-orange-600"
                  }`}
                >
                  {currentMonthBalance >= 0
                    ? "Situação positiva"
                    : "Atenção aos gastos"}
                </p>
              </div>
              <div
                className={`transition-colors ${
                  currentMonthBalance >= 0
                    ? "text-blue-500/20 group-hover:text-blue-500/30"
                    : "text-orange-500/20 group-hover:text-orange-500/30"
                }`}
              >
                {currentMonthBalance >= 0 ? (
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Modernos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg text-white">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">
                🔍 Filtros Avançados
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Busca */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Search className="w-4 h-4 text-blue-500" />
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-10"
                    placeholder="Descrição ou categoria"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value as any })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  <option value="">🔄 Todos</option>
                  <option value="income">💚 Receitas</option>
                  <option value="expense">❤️ Despesas</option>
                </select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Categoria
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  <option value="">🏷️ Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mês */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Mês
                </label>
                <select
                  value={filters.month}
                  onChange={(e) =>
                    setFilters({ ...filters, month: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      📅{" "}
                      {new Date(0, i).toLocaleDateString("pt-BR", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ano
                </label>
                <select
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        🗓️ {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Transações Moderna */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <LoadingSpinner />
                <p className="text-gray-500 animate-pulse">
                  Carregando suas transações...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl text-gray-500 font-medium">
                  Nenhuma transação encontrada
                </p>
                <p className="text-sm text-gray-400">
                  Comece criando sua primeira transação para ter controle total
                  das suas finanças!
                </p>
                <button
                  onClick={handleCreateTransaction}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ✨ Criar Primeira Transação
                </button>
              </div>
            ) : (
              <div className="min-w-full">
                {/* Header da Tabela - Apenas Desktop */}
                <div className="hidden md:block bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data
                    </div>
                    <div>Descrição</div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Categoria
                    </div>
                    <div>Pagamento</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Valor
                    </div>
                    <div className="text-right">Ações</div>
                  </div>
                </div>

                {/* Linhas da Tabela */}
                <div className="divide-y divide-gray-100">
                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Layout Desktop - Tabela */}
                      <div className="hidden md:grid grid-cols-6 gap-4 items-center px-6 py-4">
                        {/* Data */}
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDate(transaction.date)}
                        </div>

                        {/* Descrição */}
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {transaction.description || "Sem descrição"}
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full inline-block ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "💚 Receita"
                              : "❤️ Despesa"}
                          </div>
                        </div>

                        {/* Categoria */}
                        <div className="text-sm text-gray-900">
                          {getCategoryName(transaction)}
                        </div>

                        {/* Pagamento */}
                        <div className="text-sm text-gray-900">
                          {getPaymentMethodName(transaction.payment_method)}
                        </div>

                        {/* Valor */}
                        <div className="text-sm font-bold">
                          <span
                            className={`px-3 py-2 rounded-lg ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Editar transação"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Excluir transação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Layout Mobile - Card */}
                      <div className="md:hidden p-4 space-y-3">
                        {/* Cabeçalho do Card */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "💚 Receita"
                              : "❤️ Despesa"}
                          </div>
                        </div>

                        {/* Descrição */}
                        <div className="font-medium text-gray-900 text-lg">
                          {transaction.description || "Sem descrição"}
                        </div>

                        {/* Detalhes em Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {getCategoryName(transaction)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {getPaymentMethodName(transaction.payment_method)}
                            </span>
                          </div>
                        </div>

                        {/* Valor e Ações */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="text-lg font-bold">
                            <span
                              className={`px-4 py-2 rounded-lg ${
                                transaction.type === "income"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              title="Editar transação"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                              title="Excluir transação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Paginação Moderna */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700 flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                Página{" "}
                <span className="font-semibold text-blue-600">
                  {currentPage}
                </span>{" "}
                de <span className="font-semibold">{totalPages}</span>
                <span className="text-gray-500">•</span>
                <span className="font-semibold text-purple-600">
                  {totalCount}
                </span>{" "}
                total
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 disabled:hover:bg-gray-50 disabled:hover:shadow-none"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 disabled:hover:bg-gray-50 disabled:hover:shadow-none"
                  title="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Formulário Modal */}
        <TransactionForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleFormSubmit}
          editingTransaction={editingTransaction}
        />
      </div>
    </div>
  );
}
