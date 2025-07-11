import { useState, useEffect } from "react";
import { apiService, type Category } from "../lib/supabaseApi";
import {
  Plus,
  Edit3,
  Trash2,
  Tag,
  Palette,
  Hash,
  Search,
  Grid3X3,
  Save,
  X,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

const PREDEFINED_ICONS = [
  "🍔",
  "🏠",
  "🚗",
  "💊",
  "🎓",
  "🎮",
  "👕",
  "⚡",
  "📱",
  "✈️",
  "🎬",
  "🏃‍♂️",
  "🛒",
  "🍕",
  "☕",
  "🎵",
  "📚",
  "💰",
  "🎁",
  "🔧",
  "🌐",
  "🏥",
  "🚌",
  "⛽",
  "🍺",
  "🎯",
  "💻",
  "📊",
  "🏦",
  "🛡️",
];

const PREDEFINED_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    icon: "🏷️",
    color: "#3b82f6",
    type: "expense",
  });
  const [submitting, setSubmitting] = useState(false);

  // Carregar categorias
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorias
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir formulário para nova categoria
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      icon: "🏷️",
      color: "#3b82f6",
      type: "expense",
    });
    setShowForm(true);
  };

  // Abrir formulário para editar categoria
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setShowForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      icon: "🏷️",
      color: "#3b82f6",
      type: "expense",
    });
  };

  // Salvar categoria
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      setSubmitting(true);

      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, formData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await apiService.createCategory(formData);
        toast.success("Categoria criada com sucesso!");
      }

      handleCloseForm();
      loadCategories();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir categoria
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await apiService.deleteCategory(id);
      toast.success("Categoria excluída com sucesso!");
      loadCategories();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    🏷️ Categorias
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Organize suas transações por categorias
                    <span className="font-semibold text-purple-600">
                      • {categories.length} categorias
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateCategory}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 pl-10"
              placeholder="🔍 Buscar categorias..."
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Grid de Categorias */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <LoadingSpinner />
              <p className="text-gray-500 animate-pulse">
                Carregando suas categorias...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-xl text-gray-500 font-medium">
                {searchTerm
                  ? "Nenhuma categoria encontrada"
                  : "Nenhuma categoria ainda"}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm
                  ? "Tente buscar por outro termo"
                  : "Comece criando suas primeiras categorias para organizar melhor suas transações!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateCategory}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ✨ Criar Primeira Categoria
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center mb-3">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg sm:text-xl mb-2"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm sm:text-base leading-tight">
                        {category.name}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Palette className="w-3 h-3" />
                        <span
                          style={{ color: category.color }}
                          className="text-xs"
                        >
                          {category.color}
                        </span>
                      </div>

                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          title="Editar categoria"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Excluir categoria"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal do Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
                      <Tag className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingCategory
                        ? "✏️ Editar Categoria"
                        : "➕ Nova Categoria"}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Hash className="w-4 h-4 text-purple-500" />
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="Ex: Alimentação, Transporte..."
                    required
                  />
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-purple-500" />
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                  >
                    <option value="expense">💸 Despesa</option>
                    <option value="income">💰 Receita</option>
                  </select>
                </div>

                {/* Ícone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-lg">{formData.icon}</span>
                    Ícone
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-xl">
                    {PREDEFINED_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-2 rounded-lg text-lg hover:bg-purple-100 transition-all duration-200 ${
                          formData.icon === icon
                            ? "bg-purple-100 ring-2 ring-purple-300"
                            : "hover:scale-110"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all duration-200"
                    placeholder="Ou digite um emoji personalizado"
                  />
                </div>

                {/* Cor */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Palette className="w-4 h-4 text-purple-500" />
                    Cor
                  </label>
                  <div className="grid grid-cols-9 gap-2 p-2 border border-gray-200 rounded-xl">
                    {PREDEFINED_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 ${
                          formData.color === color
                            ? "ring-2 ring-gray-400 ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    👀 Preview:
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <span className="font-medium text-gray-900">
                      {formData.name || "Nome da categoria"}
                    </span>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.name.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingCategory ? "Atualizar" : "Criar"}
                      </>
                    )}
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
