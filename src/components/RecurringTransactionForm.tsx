import React, { useState, useEffect } from "react";
import {
  apiService,
  type Category,
  type RecurringTransaction,
} from "../lib/supabaseApi";
import { useEventBus, EVENTS } from "../lib/eventBus";
import {
  X,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import toast from "react-hot-toast";

interface RecurringTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: RecurringTransaction) => void;
  editingTransaction?: RecurringTransaction | null;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { emit } = useEventBus();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    frequency: "monthly" as "weekly" | "monthly" | "yearly",
    next_date: new Date().toISOString().split("T")[0],
    is_active: true,
  });

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias");
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description || "",
        category_id: editingTransaction.category_id,
        frequency: editingTransaction.frequency,
        next_date: editingTransaction.next_date,
        is_active: editingTransaction.is_active,
      });
    } else {
      // Resetar formulário para nova transação
      setFormData({
        amount: "",
        description: "",
        category_id: "",
        frequency: "monthly",
        next_date: new Date().toISOString().split("T")[0],
        is_active: true,
      });
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    try {
      setLoading(true);

      const recurringData = {
        ...formData,
        amount,
      };

      let transaction: RecurringTransaction;

      if (editingTransaction) {
        transaction = await apiService.updateRecurringTransaction(
          editingTransaction.id,
          recurringData
        );
        toast.success("Transação recorrente atualizada com sucesso!");
        emit(EVENTS.RECURRING_TRANSACTION_UPDATED, transaction);
      } else {
        transaction = await apiService.createRecurringTransaction(
          recurringData
        );
        toast.success("Transação recorrente criada com sucesso!");
        emit(EVENTS.RECURRING_TRANSACTION_CREATED, transaction);
      }

      // Emitir evento para refresh do dashboard
      emit(EVENTS.DASHBOARD_REFRESH);

      onSubmit(transaction);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação recorrente:", error);
      toast.error("Erro ao salvar transação recorrente");
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    { value: "weekly", label: "Semanal", icon: "📅" },
    { value: "monthly", label: "Mensal", icon: "🗓️" },
    { value: "yearly", label: "Anual", icon: "📆" },
  ];

  const calculateNextDates = (frequency: string, startDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 3; i++) {
      dates.push(new Date(currentDate));
      switch (frequency) {
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case "yearly":
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }

    return dates;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTransaction
                ? "Editar Transação Recorrente"
                : "Nova Transação Recorrente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Valor */}
          <div>
            <label className="form-label">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="form-input"
              placeholder="0,00"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="form-label">
              <FileText className="w-4 h-4 inline mr-1" />
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-input"
              placeholder="Descrição da transação recorrente"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="form-label">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoria *
            </label>
            {categoriesLoading ? (
              <div className="flex items-center justify-center p-4">
                <LoadingSpinner />
              </div>
            ) : categories.length > 0 ? (
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="form-input"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name} (
                    {category.type === "income" ? "Receita" : "Despesa"})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Nenhuma categoria encontrada. Vá em Configurações para criar
                categorias.
              </p>
            )}
          </div>

          {/* Frequência */}
          <div>
            <label className="form-label">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Frequência *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, frequency: option.value as any })
                  }
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.frequency === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Próxima Data */}
          <div>
            <label className="form-label">
              <Calendar className="w-4 h-4 inline mr-1" />
              Próxima Execução *
            </label>
            <input
              type="date"
              value={formData.next_date}
              onChange={(e) =>
                setFormData({ ...formData, next_date: e.target.value })
              }
              className="form-input"
              required
            />
          </div>

          {/* Preview das próximas datas */}
          {formData.next_date && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Próximas 3 execuções:
              </h4>
              <div className="space-y-1">
                {calculateNextDates(formData.frequency, formData.next_date).map(
                  (date, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {index + 1}ª: {date.toLocaleDateString("pt-BR")}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Status Ativo/Inativo */}
          {editingTransaction && (
            <div>
              <label className="form-label">Status</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    formData.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formData.is_active ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  {formData.is_active ? "Ativa" : "Inativa"}
                </button>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Salvando...
                </div>
              ) : editingTransaction ? (
                "Atualizar"
              ) : (
                "Criar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionForm;
