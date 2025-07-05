import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { apiService, type Category } from "../lib/supabaseApi";
import {
  User,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Edit3,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
  }, []);

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
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      {/* User Profile Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Perfil do Usuário
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-600">
                Usuário desde {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciar Categorias
              </h3>
            </div>
            <button
              onClick={() => setShowAddCategory(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Add/Edit Category Form */}
        {showAddCategory && (
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nome da Categoria</label>
                  <input
                    type="text"
                    className="form-input"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Ex: Alimentação, Transporte..."
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-input"
                    value={categoryForm.type}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Cor</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded border border-gray-300"
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
                      className="form-input flex-1"
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

                <div>
                  <label className="form-label">Ícone</label>
                  <div className="grid grid-cols-10 gap-2 mt-2">
                    {defaultIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`p-2 text-lg border rounded hover:bg-gray-100 ${
                          categoryForm.icon === icon
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300"
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
                    className="form-input mt-2"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                    placeholder="Ou digite um emoji"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? "Atualizar" : "Criar"} Categoria
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma categoria criada ainda.</p>
              <p className="text-sm text-gray-400 mt-2">
                Comece criando suas primeiras categorias para organizar suas
                transações.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {category.type === "income" ? "Receita" : "Despesa"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Editar categoria"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Informações do Sistema
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Versão do Sistema</p>
              <p className="font-medium">GenGastos v1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Última Atualização</p>
              <p className="font-medium">
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Categorias Criadas</p>
              <p className="font-medium">{categories.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Conta Criada</p>
              <p className="font-medium">
                {new Date(user?.created_at || "").toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
