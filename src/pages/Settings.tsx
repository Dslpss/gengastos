import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import {
  apiService,
  type Category,
  type UserSettings,
} from "../lib/supabaseApi";
import {
  User,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Edit3,
  Save,
  X,
  DollarSign,
  Tag,
  Wallet,
  Shield,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ExtraBalanceManager from "../components/ExtraBalanceManager";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Salário/Saldo Inicial
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [salaryInput, setSalaryInput] = useState("");
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryEditMode, setSalaryEditMode] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "#3B82F6",
    icon: "📝",
    type: "expense" as "income" | "expense",
  });

  const defaultIcons = [
    "🍔",
    "🛒",
    "🏠",
    "🚗",
    "⛽",
    "💊",
    "🎮",
    "👕",
    "📱",
    "💡",
    "🎬",
    "✈️",
    "🏥",
    "📚",
    "🎯",
    "💰",
    "💳",
    "🎁",
    "🍕",
    "☕",
    "🌟",
    "📊",
    "💼",
    "🏦",
    "🔧",
    "🎵",
    "🏃",
    "🍎",
    "📝",
    "💡",
  ];

  useEffect(() => {
    loadCategories();
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setSalaryLoading(true);
      const settings = await apiService.getUserSettings();
      setUserSettings(settings);
      setSalaryInput(settings ? String(settings.salary) : "");
    } catch (error: any) {
      toast.error("Erro ao carregar salário/saldo inicial");
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalaryLoading(true);
      const value = parseFloat(salaryInput.replace(/,/g, "."));
      if (isNaN(value) || value < 0) {
        toast.error("Informe um valor válido para o salário/saldo.");
        return;
      }
      const saved = await apiService.upsertUserSettings(value);
      setUserSettings(saved);
      setSalaryEditMode(false);
      toast.success("Salário/saldo salvo com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar salário/saldo inicial");
    } finally {
      setSalaryLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, categoryForm);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await apiService.createCategory(categoryForm);
        toast.success("Categoria criada com sucesso!");
      }

      setShowAddCategory(false);
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        color: "#3B82F6",
        icon: "📝",
        type: "expense",
      });
      await loadCategories();
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
    });
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await apiService.deleteCategory(id);
      toast.success("Categoria excluída com sucesso!");
      await loadCategories();
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  const cancelForm = () => {
    setShowAddCategory(false);
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      color: "#3B82F6",
      icon: "📝",
      type: "expense",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600 animate-pulse">
            Carregando suas configurações...
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
              <SettingsIcon className="w-8 h-8" />
            </div>
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-bold break-words bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ⚙️ Configurações
              </h1>
              <p className="text-gray-600">
                Personalize sua experiência financeira
              </p>
            </div>
          </div>
        </div>

        {/* Perfil do Usuário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  👤 Perfil do Usuário
                </h3>
                <p className="text-sm text-gray-600">
                  Informações da sua conta
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate break-all">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-600 truncate">Usuário ativo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações Financeiras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Salário/Saldo Inicial */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    💰 Salário / Saldo Inicial
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure sua renda base mensal
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {salaryLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                </div>
              ) : salaryEditMode ? (
                <form
                  onSubmit={handleSaveSalary}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      💵 Valor do Salário
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 pl-10 sm:pl-12 text-sm sm:text-base"
                        value={salaryInput}
                        onChange={(e) => setSalaryInput(e.target.value)}
                        placeholder="Ex: 3500.00"
                        autoFocus
                      />
                      <DollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                      onClick={() => {
                        setSalaryEditMode(false);
                        setSalaryInput(
                          userSettings ? String(userSettings.salary) : ""
                        );
                      }}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 mb-1 truncate">
                          💰 Salário Atual
                        </p>
                        <p className="text-2xl font-bold text-gray-900 truncate">
                          {userSettings
                            ? userSettings.salary.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                            : "R$ 0,00"}
                        </p>
                      </div>
                      <button
                        className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        onClick={() => setSalaryEditMode(true)}
                      >
                        <Edit3 className="w-4 h-4" />
                        {userSettings?.salary ? "Editar" : "Cadastrar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saldos Extras */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    💎 Gerenciar Saldos Extras
                  </h3>
                  <p className="text-sm text-gray-600">
                    Adicione bonificações, investimentos e vendas
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <ExtraBalanceManager
                userSettings={userSettings}
                onUpdate={setUserSettings}
              />
            </div>
          </div>
        </div>

        {/* Gerenciamento de Categorias */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    🏷️ Gerenciar Categorias
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Organize suas transações por categoria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Nova Categoria
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Add/Edit Category Form */}
            {showAddCategory && (
              <div className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 mb-4 sm:mb-6">
                <form
                  onSubmit={handleSubmitCategory}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        📝 Nome da Categoria
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-sm sm:text-base"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Alimentação, Transporte..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        🔄 Tipo
                      </label>
                      <select
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white text-sm sm:text-base"
                        value={categoryForm.type}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            type: e.target.value as "income" | "expense",
                          })
                        }
                      >
                        <option value="expense">❤️ Despesa</option>
                        <option value="income">💚 Receita</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        🎨 Cor
                      </label>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <input
                          type="color"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border border-gray-300 cursor-pointer"
                          value={categoryForm.color}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              color: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-sm sm:text-base"
                          value={categoryForm.color}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              color: e.target.value,
                            })
                          }
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        😀 Ícone
                      </label>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2 mt-2">
                        {defaultIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            className={`p-2 sm:p-3 text-lg sm:text-xl border rounded-lg sm:rounded-xl hover:bg-white transition-all duration-200 ${
                              categoryForm.icon === icon
                                ? "border-orange-500 bg-orange-50 shadow-lg"
                                : "border-gray-300 hover:border-orange-300"
                            }`}
                            onClick={() =>
                              setCategoryForm({ ...categoryForm, icon })
                            }
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 mt-3 text-sm sm:text-base"
                        value={categoryForm.icon}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            icon: e.target.value,
                          })
                        }
                        placeholder="Ou digite um emoji personalizado"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      {editingCategory ? "Atualizar" : "Criar"} Categoria
                    </button>
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            {categories.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">🏷️</div>
                <p className="text-xl text-gray-500 font-medium">
                  Nenhuma categoria criada ainda
                </p>
                <p className="text-sm text-gray-400">
                  Comece criando suas primeiras categorias para organizar suas
                  transações!
                </p>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ✨ Criar Primeira Categoria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className={`border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col space-y-2">
                      {/* Ícone e Nome */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                              border: `1px solid ${category.color}30`,
                            }}
                          >
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs truncate">
                              {category.name}
                            </p>
                          </div>
                        </div>
                        {/* Ações */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Editar categoria"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Excluir categoria"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Tipo */}
                      <div className="flex justify-center">
                        <p
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            category.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {category.type === "income"
                            ? "💚 Receita"
                            : "❤️ Despesa"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  ℹ️ Informações do Sistema
                </h3>
                <p className="text-sm text-gray-600">
                  Detalhes sobre sua conta e sistema
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">
                    📱 Versão do Sistema
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    GenGastos v1.0.0
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">
                    🏷️ Categorias Criadas
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {categories.length}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">
                    🔄 Última Atualização
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">📅 Conta Criada</p>
                  <p className="font-bold text-lg text-gray-900">
                    {new Date(user?.created_at || "").toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
