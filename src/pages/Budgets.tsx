import { useState, useEffect } from "react";
import { apiService, type Budget, type Category } from "../lib/supabaseApi";
import {
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Carregar dados
  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setFormData({
      category_id: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setShowForm(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
    });
    setShowForm(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) {
      return;
    }

    try {
      await apiService.deleteBudget(id);
      toast.success("Orçamento excluído com sucesso!");
      loadBudgets();
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
      toast.error("Erro ao excluir orçamento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const budgetData = {
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year,
      };

      if (editingBudget) {
        await apiService.updateBudget(editingBudget.id, budgetData);
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await apiService.createBudget(budgetData);
        toast.success("Orçamento criado com sucesso!");
      }

      setShowForm(false);
      loadBudgets();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast.error("Erro ao salvar orçamento");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBudgetStatus = (budget: Budget) => {
    const spent = budget.spent || 0;
    const percentage = (spent / budget.amount) * 100;

    if (percentage >= 100) {
      return { status: "exceeded", color: "red", icon: AlertTriangle };
    } else if (percentage >= 80) {
      return { status: "warning", color: "orange", icon: Clock };
    } else {
      return { status: "good", color: "green", icon: CheckCircle };
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category
      ? `${category.icon} ${category.name}`
      : "Categoria não encontrada";
  };

  // Calcular estatísticas
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + (budget.spent || 0),
    0
  );
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage =
    totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    🎯 Orçamentos
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Controle seus gastos por categoria •
                    <span className="font-semibold text-purple-600">
                      {budgets.length} orçamentos
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateBudget}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Novo Orçamento
            </button>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Orçado */}
          <div className="group bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-blue-700">
                    💙 Total Orçado
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(totalBudgeted)}
                </p>
                <p className="text-xs text-blue-600">
                  {budgets.length} orçamentos ativos
                </p>
              </div>
            </div>
          </div>

          {/* Total Gasto */}
          <div className="group bg-gradient-to-br from-red-50 to-rose-100 border border-red-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-500 rounded-lg text-white">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-red-700">
                    ❤️ Total Gasto
                  </p>
                </div>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-xs text-red-600">
                  {overallPercentage.toFixed(1)}% do orçamento
                </p>
              </div>
            </div>
          </div>

          {/* Restante */}
          <div
            className={`group border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              totalRemaining >= 0
                ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50"
                : "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg text-white ${
                      totalRemaining >= 0 ? "bg-green-500" : "bg-orange-500"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      totalRemaining >= 0 ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {totalRemaining >= 0 ? "💚 Restante" : "🧡 Excedido"}
                  </p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    totalRemaining >= 0 ? "text-green-800" : "text-orange-800"
                  }`}
                >
                  {formatCurrency(Math.abs(totalRemaining))}
                </p>
                <p
                  className={`text-xs ${
                    totalRemaining >= 0 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {totalRemaining >= 0
                    ? "Dentro do orçamento"
                    : "Acima do limite"}
                </p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="group bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-purple-700">
                    💜 Performance
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {overallPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">
                  {overallPercentage <= 80
                    ? "Excelente controle"
                    : overallPercentage <= 100
                    ? "Atenção aos gastos"
                    : "Orçamento excedido"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Orçamentos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <LoadingSpinner />
              <p className="text-gray-500 animate-pulse">
                Carregando seus orçamentos...
              </p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-xl text-gray-500 font-medium">
                Nenhum orçamento encontrado
              </p>
              <p className="text-sm text-gray-400">
                Crie orçamentos para controlar melhor seus gastos por categoria!
              </p>
              <button
                onClick={handleCreateBudget}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                ✨ Criar Primeiro Orçamento
              </button>
            </div>
          ) : (
            <div>
              {/* Header da Lista */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Categoria
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Período
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Orçamento
                  </div>
                  <div>Progresso</div>
                  <div className="text-right">Ações</div>
                </div>
              </div>

              {/* Linhas da Lista */}
              <div className="divide-y divide-gray-100">
                {budgets.map((budget, index) => {
                  const budgetStatus = getBudgetStatus(budget);
                  const percentage =
                    ((budget.spent || 0) / budget.amount) * 100;
                  const StatusIcon = budgetStatus.icon;

                  return (
                    <div
                      key={budget.id}
                      className={`px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        {/* Categoria */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg text-white bg-${budgetStatus.color}-500`}
                          >
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getCategoryName(budget.category_id)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {budget.category?.type === "income"
                                ? "💚 Receita"
                                : "❤️ Despesa"}
                            </div>
                          </div>
                        </div>

                        {/* Período */}
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {new Date(0, budget.month - 1).toLocaleDateString(
                              "pt-BR",
                              { month: "long" }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {budget.year}
                          </div>
                        </div>

                        {/* Orçamento */}
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(budget.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Gasto: {formatCurrency(budget.spent || 0)}
                          </div>
                        </div>

                        {/* Progresso */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <StatusIcon
                              className={`w-4 h-4 text-${budgetStatus.color}-500`}
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 bg-${budgetStatus.color}-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Restante:{" "}
                            {formatCurrency(
                              budget.amount - (budget.spent || 0)
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Editar orçamento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Excluir orçamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Formulário Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {editingBudget ? "✏️ Editar Orçamento" : "✨ Novo Orçamento"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Categoria */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    🏷️ Categoria *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    💰 Valor do Orçamento *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                {/* Período */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      📅 Mês
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          month: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleDateString("pt-BR", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      🗓️ Ano
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    ❌ Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {editingBudget ? "💾 Salvar" : "✨ Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
