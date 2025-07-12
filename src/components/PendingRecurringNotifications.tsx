import React, { useState, useEffect } from "react";
import { apiService, type RecurringTransaction } from "../lib/supabaseApi";
import { Link } from "react-router-dom";
import { Clock, Play, RefreshCw, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const PendingRecurringNotifications: React.FC = () => {
  const [pendingTransactions, setPendingTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    try {
      const pending = await apiService.getPendingRecurringTransactions();
      setPendingTransactions(pending);
    } catch (error) {
      console.error(
        "Erro ao carregar transações recorrentes pendentes:",
        error
      );
    }
  };

  const executeTransaction = async (id: string) => {
    try {
      setLoading(true);
      await apiService.executeRecurringTransaction(id);
      toast.success("Transação executada com sucesso!");
      loadPendingTransactions(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao executar transação:", error);
      toast.error("Erro ao executar transação");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getCategoryType = (transaction: RecurringTransaction) => {
    if (transaction.category) {
      const category = transaction.category as any;
      return category.type;
    }
    return "expense";
  };

  const getCategoryName = (transaction: RecurringTransaction) => {
    if (transaction.category) {
      const category = transaction.category as any;
      return `${category.icon} ${category.name}`;
    }
    return "Sem categoria";
  };

  if (pendingTransactions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-lg text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-800">
              ⏰ Transações Recorrentes Pendentes
            </h3>
            <p className="text-sm text-orange-600">
              {pendingTransactions.length} transação(ões) para executar hoje
            </p>
          </div>
        </div>
        <Link
          to="/recurring"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {pendingTransactions.slice(0, 3).map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm border border-orange-100"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getCategoryType(transaction) === "income" ? "💚" : "❤️"}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.description || "Transação recorrente"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{getCategoryName(transaction)}</span>
                  <span>•</span>
                  <span
                    className={`font-semibold ${
                      getCategoryType(transaction) === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getCategoryType(transaction) === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => executeTransaction(transaction.id)}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Executar
            </button>
          </div>
        ))}

        {pendingTransactions.length > 3 && (
          <div className="text-center pt-2">
            <Link
              to="/recurring"
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              + {pendingTransactions.length - 3} mais transações pendentes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRecurringNotifications;
