import React, { useState, useEffect } from "react";
import {
  apiService,
  type Category,
  type Transaction,
} from "../lib/supabaseApi";
import { useEventBus, EVENTS } from "../lib/eventBus";
import { useNotifications } from "../hooks/useNotifications";
import {
  X,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  FileText,
} from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import toast from "react-hot-toast";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
  editingTransaction?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { emit } = useEventBus();
  const { addBudgetAlert, addUnusualTransactionAlert } = useNotifications();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category_id: "",
    payment_method: "cash" as
      | "cash"
      | "credit_card"
      | "debit_card"
      | "pix"
      | "transfer",
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
        date: editingTransaction.date.split("T")[0],
        type: editingTransaction.type,
        category_id: editingTransaction.category_id,
        payment_method: editingTransaction.payment_method,
      });
    } else {
      // Resetar formulário para nova transação
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category_id: "",
        payment_method: "cash",
      });
    }
  }, [editingTransaction, isOpen]);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

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

      const transactionData = {
        ...formData,
        amount,
      };

      let transaction: Transaction;

      if (editingTransaction) {
        transaction = await apiService.updateTransaction(
          editingTransaction.id,
          transactionData
        );
        toast.success("Transação atualizada com sucesso!");
        emit(EVENTS.TRANSACTION_UPDATED, transaction);
      } else {
        transaction = await apiService.createTransaction(transactionData);
        toast.success("Transação criada com sucesso!");
        emit(EVENTS.TRANSACTION_CREATED, transaction);

        // Verificar alertas para novas transações
        if (formData.type === "expense") {
          // Verificar se orçamento foi estourado
          await addBudgetAlert(formData.category_id, amount);
        }

        // Verificar transação incomum
        await addUnusualTransactionAlert(amount, formData.type);
      }

      // Emitir evento para refresh do dashboard
      emit(EVENTS.DASHBOARD_REFRESH);

      onSubmit(transaction);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast.error("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    { value: "cash", label: "Dinheiro", icon: "💵" },
    { value: "credit_card", label: "Cartão de Crédito", icon: "💳" },
    { value: "debit_card", label: "Cartão de Débito", icon: "💳" },
    { value: "pix", label: "PIX", icon: "📱" },
    { value: "transfer", label: "Transferência", icon: "🏦" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTransaction ? "Editar Transação" : "Nova Transação"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="form-label">Tipo de Transação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: "expense", category_id: "" })
                }
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.type === "expense"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                📉 Despesa
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: "income", category_id: "" })
                }
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.type === "income"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                📈 Receita
              </button>
            </div>
          </div>

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

          {/* Categoria */}
          <div>
            <label className="form-label">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoria *
            </label>
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="form-input"
                required
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            )}
            {filteredCategories.length === 0 && !categoriesLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhuma categoria de{" "}
                {formData.type === "income" ? "receita" : "despesa"} encontrada.
                Vá em Configurações para criar categorias.
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="form-label">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="form-input"
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="form-label">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Método de Pagamento
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_method: e.target.value as any,
                })
              }
              className="form-input"
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="form-label">
              <FileText className="w-4 h-4 inline mr-1" />
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-input"
              rows={3}
              placeholder="Adicione uma descrição (opcional)"
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || categoriesLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <LoadingSpinner />
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

export default TransactionForm;
