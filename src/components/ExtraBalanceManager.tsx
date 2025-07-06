import React, { useState } from "react";
import { apiService, type UserSettings } from "../lib/supabaseApi";
import {
  DollarSign,
  TrendingUp,
  Award,
  PiggyBank,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import toast from "react-hot-toast";

interface ExtraBalance {
  type: "bonus" | "investment" | "sales" | "other";
  label: string;
  icon: React.ReactNode;
  color: string;
  value: number;
}

interface ExtraBalanceManagerProps {
  userSettings: UserSettings | null;
  onUpdate: (settings: UserSettings) => void;
}

const ExtraBalanceManager: React.FC<ExtraBalanceManagerProps> = ({
  userSettings,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const extraBalances: ExtraBalance[] = [
    {
      type: "bonus",
      label: "Bonificações",
      icon: <Award className="w-5 h-5" />,
      color: "text-yellow-600",
      value: userSettings?.bonus_balance || 0,
    },
    {
      type: "investment",
      label: "Investimentos",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600",
      value: userSettings?.investment_balance || 0,
    },
    {
      type: "sales",
      label: "Vendas",
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      value: userSettings?.sales_balance || 0,
    },
    {
      type: "other",
      label: "Outros",
      icon: <PiggyBank className="w-5 h-5" />,
      color: "text-purple-600",
      value: userSettings?.other_balance || 0,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleEdit = (type: string, currentValue: number) => {
    setEditingType(type);
    setEditValue(currentValue.toString());
  };

  const handleSave = async () => {
    if (!editingType) return;

    try {
      setLoading(true);
      const value = parseFloat(editValue) || 0;

      const balances = {
        [`${editingType}_balance`]: value,
      };

      const updatedSettings = await apiService.updateExtraBalances(balances);

      if (updatedSettings) {
        onUpdate(updatedSettings);
        toast.success("Saldo atualizado com sucesso!");
        setEditingType(null);
        setEditValue("");
      } else {
        toast.error("Erro ao atualizar saldo");
      }
    } catch (error) {
      console.error("Erro ao salvar saldo:", error);
      toast.error("Erro ao salvar saldo");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setEditValue("");
  };

  const handleQuickAdd = async (type: string, amount: number) => {
    try {
      setLoading(true);
      const currentBalance =
        extraBalances.find((b) => b.type === type)?.value || 0;
      const newBalance = Math.max(0, currentBalance + amount);

      const balances = {
        [`${type}_balance`]: newBalance,
      };

      const updatedSettings = await apiService.updateExtraBalances(balances);

      if (updatedSettings) {
        onUpdate(updatedSettings);
        toast.success(
          `${amount > 0 ? "Adicionado" : "Subtraído"} ${formatCurrency(
            Math.abs(amount)
          )}`
        );
      } else {
        toast.error("Erro ao atualizar saldo");
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      toast.error("Erro ao atualizar saldo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Saldos Extras</h3>
        <div className="text-sm text-gray-500">
          Total: {formatCurrency(userSettings?.total_extra_balance || 0)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extraBalances.map((balance) => (
          <div
            key={balance.type}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={balance.color}>{balance.icon}</div>
                <span className="font-medium text-gray-900">
                  {balance.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(balance.value)}
                </div>
              </div>
            </div>

            {editingType === balance.type ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Novo valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {loading ? <LoadingSpinner /> : "Salvar"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAdd(balance.type, -100)}
                    disabled={loading || balance.value < 100}
                    className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleQuickAdd(balance.type, -10)}
                    disabled={loading || balance.value < 10}
                    className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xs">-10</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdd(balance.type, 10)}
                    disabled={loading}
                    className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50"
                  >
                    <span className="text-xs">+10</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdd(balance.type, 100)}
                    disabled={loading}
                    className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(balance.type, balance.value)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 text-sm"
                >
                  Editar Valor
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Saldo Total Extra</h4>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {formatCurrency(userSettings?.total_extra_balance || 0)}
        </div>
        <div className="text-sm text-blue-700 mt-2">
          Este valor é somado ao seu saldo principal no dashboard
        </div>
      </div>
    </div>
  );
};

export default ExtraBalanceManager;
