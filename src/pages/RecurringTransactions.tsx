import { useState, useEffect, useCallback } from "react";
import {
  apiService,
  type RecurringTransaction,
} from "../lib/supabaseApi";
import { useEventBus, EVENTS } from "../lib/eventBus";
import RecurringTransactionForm from "../components/RecurringTransactionForm";
import {
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Play,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function RecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const { emit } = useEventBus();

  // Carregar transações recorrentes
  const loadRecurringTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [recurring, pending] = await Promise.all([
        apiService.getRecurringTransactions(),
        apiService.getPendingRecurringTransactions(),
      ]);

      setRecurringTransactions(recurring);
      setPendingTransactions(pending);
    } catch (error) {
      console.error("Erro ao carregar transações recorrentes:", error);
      toast.error("Erro ao carregar transações recorrentes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecurringTransactions();
  }, [loadRecurringTransactions]);

  const handleCreateRecurring = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditRecurring = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteRecurring = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação recorrente?")) {
      return;
    }

    try {
      await apiService.deleteRecurringTransaction(id);
      toast.success("Transação recorrente excluída com sucesso!");
      emit(EVENTS.RECURRING_TRANSACTION_DELETED, { id });
      emit(EVENTS.DASHBOARD_REFRESH);
      loadRecurringTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação recorrente:", error);
      toast.error("Erro ao excluir transação recorrente");
    }
  };

  const handleExecuteRecurring = async (id: string) => {
    try {
      const result = await apiService.executeRecurringTransaction(id);
      toast.success("Transação executada com sucesso!");
      emit(EVENTS.TRANSACTION_CREATED, result.transaction);
      emit(EVENTS.DASHBOARD_REFRESH);
      loadRecurringTransactions(); // Recarregar para atualizar próximas datas
    } catch (error) {
      console.error("Erro ao executar transação recorrente:", error);
      toast.error("Erro ao executar transação recorrente");
    }
  };

  const handleToggleActive = async (transaction: RecurringTransaction) => {
    try {
      await apiService.updateRecurringTransaction(transaction.id, {
        is_active: !transaction.is_active,
      });
      toast.success(
        `Transação ${
          !transaction.is_active ? "ativada" : "desativada"
        } com sucesso!`
      );
      loadRecurringTransactions();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da transação");
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTransaction(null);
    loadRecurringTransactions();
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

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: "📅 Semanal",
      monthly: "🗓️ Mensal",
      yearly: "📆 Anual",
    };
    return labels[frequency] || frequency;
  };

  const getCategoryName = (transaction: RecurringTransaction) => {
    if (transaction.category) {
      const category = transaction.category as any;
      return `${category.icon} ${category.name}`;
    }
    return "Sem categoria";
  };

  const getCategoryType = (transaction: RecurringTransaction) => {
    if (transaction.category) {
      const category = transaction.category as any;
      return category.type;
    }
    return "expense";
  };

  // Calcular estatísticas
  const activeRecurring = recurringTransactions.filter((t) => t.is_active);
  const monthlyTotal = activeRecurring.reduce((sum, t) => {
    const multiplier =
      t.frequency === "weekly" ? 4.33 : t.frequency === "yearly" ? 1 / 12 : 1;
    const categoryType = getCategoryType(t);
    return (
      sum + (categoryType === "income" ? t.amount : -t.amount) * multiplier
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    🔄 Transações Recorrentes
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Automatize suas receitas e despesas fixas
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateRecurring}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Nova Recorrente
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Ativas */}
          <div className="group bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-blue-700">💼 Ativas</p>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {activeRecurring.length}
                </p>
                <p className="text-xs text-blue-600">
                  de {recurringTransactions.length} total
                </p>
              </div>
            </div>
          </div>

          {/* Pendentes */}
          <div className="group bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500 rounded-lg text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-orange-700">
                    ⏰ Pendentes
                  </p>
                </div>
                <p className="text-2xl font-bold text-orange-800">
                  {pendingTransactions.length}
                </p>
                <p className="text-xs text-orange-600">para executar hoje</p>
              </div>
            </div>
          </div>

          {/* Impacto Mensal */}
          <div
            className={`group border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              monthlyTotal >= 0
                ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50"
                : "bg-gradient-to-br from-red-50 to-rose-100 border-red-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg text-white ${
                      monthlyTotal >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {monthlyTotal >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      monthlyTotal >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    💰 Impacto Mensal
                  </p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    monthlyTotal >= 0 ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {formatCurrency(monthlyTotal)}
                </p>
                <p
                  className={`text-xs ${
                    monthlyTotal >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {monthlyTotal >= 0 ? "saldo positivo" : "saldo negativo"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transações Pendentes */}
        {pendingTransactions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-800">
                Transações Pendentes para Hoje
              </h3>
            </div>
            <div className="grid gap-3">
              {pendingTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCategoryType(transaction) === "income" ? "💚" : "❤️"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || "Transação recorrente"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getCategoryName(transaction)} •{" "}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExecuteRecurring(transaction.id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Executar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Transações Recorrentes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-700 rounded-lg text-white">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">
                🔄 Suas Transações Recorrentes
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <LoadingSpinner />
                <p className="text-gray-500 animate-pulse">
                  Carregando transações recorrentes...
                </p>
              </div>
            ) : recurringTransactions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">🔄</div>
                <p className="text-xl text-gray-500 font-medium">
                  Nenhuma transação recorrente encontrada
                </p>
                <p className="text-sm text-gray-400">
                  Automatize suas receitas e despesas fixas para ter controle
                  total!
                </p>
                <button
                  onClick={handleCreateRecurring}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ✨ Criar Primeira Recorrente
                </button>
              </div>
            ) : (
              <div className="min-w-full">
                {/* Header da Tabela - Apenas Desktop */}
                <div className="hidden md:block bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-7 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Categoria
                    </div>
                    <div>Descrição</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Valor
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Frequência
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Próxima
                    </div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                  </div>
                </div>

                {/* Linhas da Tabela */}
                <div className="divide-y divide-gray-100">
                  {recurringTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Layout Desktop - Tabela */}
                      <div className="hidden md:grid grid-cols-7 gap-4 items-center px-6 py-4">
                        {/* Categoria */}
                        <div className="text-sm text-gray-900">
                          {getCategoryName(transaction)}
                        </div>

                        {/* Descrição */}
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {transaction.description || "Sem descrição"}
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full inline-block ${
                              getCategoryType(transaction) === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {getCategoryType(transaction) === "income"
                              ? "💚 Receita"
                              : "❤️ Despesa"}
                          </div>
                        </div>

                        {/* Valor */}
                        <div className="text-sm font-bold">
                          <span
                            className={`px-3 py-2 rounded-lg ${
                              getCategoryType(transaction) === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {getCategoryType(transaction) === "income"
                              ? "+"
                              : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>

                        {/* Frequência */}
                        <div className="text-sm text-gray-900">
                          {getFrequencyLabel(transaction.frequency)}
                        </div>

                        {/* Próxima Data */}
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.next_date)}
                        </div>

                        {/* Status */}
                        <div>
                          <button
                            onClick={() => handleToggleActive(transaction)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              transaction.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {transaction.is_active ? "✅ Ativa" : "⏸️ Inativa"}
                          </button>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          {transaction.is_active && (
                            <button
                              onClick={() =>
                                handleExecuteRecurring(transaction.id)
                              }
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-200"
                              title="Executar agora"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditRecurring(transaction)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Editar transação recorrente"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRecurring(transaction.id)
                            }
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Excluir transação recorrente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Layout Mobile - Card */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">
                              {getCategoryType(transaction) === "income"
                                ? "💚"
                                : "❤️"}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${
                                getCategoryType(transaction) === "income"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {getCategoryType(transaction) === "income"
                                ? "💚 Receita"
                                : "❤️ Despesa"}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleActive(transaction)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {transaction.is_active ? "✅ Ativa" : "⏸️ Inativa"}
                          </button>
                        </div>

                        <div className="font-medium text-gray-900 text-lg">
                          {transaction.description || "Sem descrição"}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {getCategoryName(transaction)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {getFrequencyLabel(transaction.frequency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {formatDate(transaction.next_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span
                              className={`font-bold ${
                                getCategoryType(transaction) === "income"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {getCategoryType(transaction) === "income"
                                ? "+"
                                : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="text-lg font-bold">
                            <span
                              className={`px-4 py-2 rounded-lg ${
                                getCategoryType(transaction) === "income"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {getCategoryType(transaction) === "income"
                                ? "+"
                                : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {transaction.is_active && (
                              <button
                                onClick={() =>
                                  handleExecuteRecurring(transaction.id)
                                }
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-200"
                                title="Executar agora"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditRecurring(transaction)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteRecurring(transaction.id)
                              }
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                              title="Excluir"
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
        </div>

        {/* Formulário Modal */}
        <RecurringTransactionForm
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
