import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { apiService } from "../lib/supabaseApi";
import LoadingSpinner from "./ui/LoadingSpinner";
import CashFlowSimulator from "./CashFlowSimulator";
import type { CashFlowForecastPoint, ForecastSummary } from "../types";

interface CashFlowForecastProps {
  className?: string;
}

interface ScenarioSimulation {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  frequency: "once" | "weekly" | "monthly";
}

const CashFlowForecast: React.FC<CashFlowForecastProps> = ({
  className = "",
}) => {
  const [forecastData, setForecastData] = useState<CashFlowForecastPoint[]>([]);
  const [originalForecastData, setOriginalForecastData] = useState<
    CashFlowForecastPoint[]
  >([]);
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [includeRecurring, setIncludeRecurring] = useState(true);
  const [activeScenarios, setActiveScenarios] = useState<ScenarioSimulation[]>(
    []
  );

  useEffect(() => {
    loadForecastData();
  }, [forecastDays, includeRecurring]);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getCashFlowForecast(
        forecastDays,
        includeRecurring
      );
      setOriginalForecastData(response.forecast);

      // Aplicar cenários se existirem
      const updatedForecast =
        activeScenarios.length > 0
          ? applyScenarios(response.forecast, activeScenarios)
          : response.forecast;

      setForecastData(updatedForecast);

      // Calcular resumo
      const currentBalance = response.currentBalance;
      const lastPoint = updatedForecast[updatedForecast.length - 1];
      const projectedBalance = lastPoint?.balance || currentBalance;

      const balances = updatedForecast.map(
        (point: CashFlowForecastPoint) => point.balance
      );
      const highestBalance = Math.max(...balances);
      const lowestBalance = Math.min(...balances);

      // Encontrar primeiro dia com saldo negativo
      const negativePoint = updatedForecast.find(
        (point: CashFlowForecastPoint) => point.balance < 0
      );
      const daysUntilNegative = negativePoint
        ? updatedForecast.indexOf(negativePoint)
        : null;

      const totalChange = projectedBalance - currentBalance;
      const averageDailyChange = totalChange / forecastDays;

      setSummary({
        currentBalance,
        projectedBalance,
        highestBalance,
        lowestBalance,
        daysUntilNegative,
        averageDailyChange,
      });
    } catch (err) {
      console.error("Erro ao carregar previsão:", err);
      setError("Não foi possível carregar a previsão de fluxo de caixa");
    } finally {
      setIsLoading(false);
    }
  };

  const applyScenarios = (
    baseForecast: CashFlowForecastPoint[],
    scenarios: ScenarioSimulation[]
  ): CashFlowForecastPoint[] => {
    const updatedForecast = [...baseForecast];

    scenarios.forEach((scenario) => {
      const scenarioDate = new Date(scenario.date);

      updatedForecast.forEach((point, index) => {
        const pointDate = new Date(point.date);
        let shouldApply = false;

        if (scenario.frequency === "once") {
          shouldApply =
            pointDate.toDateString() === scenarioDate.toDateString();
        } else if (scenario.frequency === "weekly") {
          const daysDiff = Math.floor(
            (pointDate.getTime() - scenarioDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          shouldApply = daysDiff >= 0 && daysDiff % 7 === 0;
        } else if (scenario.frequency === "monthly") {
          shouldApply =
            pointDate.getDate() === scenarioDate.getDate() &&
            pointDate >= scenarioDate;
        }

        if (shouldApply) {
          const impact =
            scenario.type === "income" ? scenario.amount : -scenario.amount;
          updatedForecast[index] = {
            ...point,
            balance: point.balance + impact,
            change: point.change + impact,
          };

          // Propagar o impacto para os dias seguintes
          for (let i = index + 1; i < updatedForecast.length; i++) {
            updatedForecast[i] = {
              ...updatedForecast[i],
              balance: updatedForecast[i].balance + impact,
            };
          }
        }
      });
    });

    return updatedForecast;
  };

  const handleScenarioSimulation = (scenarios: ScenarioSimulation[]) => {
    setActiveScenarios(scenarios);

    if (scenarios.length === 0) {
      setForecastData(originalForecastData);
    } else {
      const updatedForecast = applyScenarios(originalForecastData, scenarios);
      setForecastData(updatedForecast);
    }

    // Recalcular resumo com os novos dados
    if (originalForecastData.length > 0) {
      const currentBalance = originalForecastData[0]?.balance || 0;
      const lastPoint = forecastData[forecastData.length - 1];
      const projectedBalance = lastPoint?.balance || currentBalance;

      const balances = forecastData.map(
        (point: CashFlowForecastPoint) => point.balance
      );
      const highestBalance = Math.max(...balances);
      const lowestBalance = Math.min(...balances);

      const negativePoint = forecastData.find(
        (point: CashFlowForecastPoint) => point.balance < 0
      );
      const daysUntilNegative = negativePoint
        ? forecastData.indexOf(negativePoint)
        : null;

      const totalChange = projectedBalance - currentBalance;
      const averageDailyChange = totalChange / forecastDays;

      setSummary({
        currentBalance,
        projectedBalance,
        highestBalance,
        lowestBalance,
        daysUntilNegative,
        averageDailyChange,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{formatDate(label)}</p>
          <p className="text-blue-600">Saldo: {formatCurrency(data.balance)}</p>
          {data.change !== 0 && (
            <p className={data.change > 0 ? "text-green-600" : "text-red-600"}>
              Variação: {data.change > 0 ? "+" : ""}
              {formatCurrency(data.change)}
            </p>
          )}
          <p className="text-xs text-gray-500 capitalize">{data.type}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadForecastData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📈 Previsão de Fluxo de Caixa
          </h3>
          <p className="text-sm text-gray-600">
            Projeção baseada no histórico de transações
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 sm:flex-none"
          >
            <option value={7}>7 dias</option>
            <option value={15}>15 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>

          <label className="flex items-center text-sm whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeRecurring}
              onChange={(e) => setIncludeRecurring(e.target.checked)}
              className="mr-2"
            />
            Incluir recorrentes
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Saldo Atual</p>
            <p className="text-base sm:text-lg font-bold text-blue-700 break-words">
              {formatCurrency(summary.currentBalance)}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">
              Saldo Projetado
            </p>
            <p className="text-base sm:text-lg font-bold text-green-700 break-words">
              {formatCurrency(summary.projectedBalance)}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Maior Saldo</p>
            <p className="text-base sm:text-lg font-bold text-purple-700 break-words">
              {formatCurrency(summary.highestBalance)}
            </p>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-xs text-red-600 font-medium">Menor Saldo</p>
            <p className="text-base sm:text-lg font-bold text-red-700 break-words">
              {formatCurrency(summary.lowestBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {summary &&
        summary.daysUntilNegative !== null &&
        summary.daysUntilNegative < forecastDays && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex items-start">
              <span className="text-red-500 text-lg mr-2 mt-0.5 flex-shrink-0">⚠️</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-800 text-sm sm:text-base">
                  Alerta de Saldo Negativo
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  Projeção indica saldo negativo em {summary.daysUntilNegative}{" "}
                  dias. Considere revisar seus gastos ou aumentar receitas.
                </p>
              </div>
            </div>
          </div>
        )}

      {summary && summary.averageDailyChange > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex items-start">
            <span className="text-green-500 text-lg mr-2 mt-0.5 flex-shrink-0">✅</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-800 text-sm sm:text-base">Tendência Positiva</p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">
                Seu saldo está crescendo em média{" "}
                {formatCurrency(summary.averageDailyChange)} por dia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            📊 Baseado em{" "}
            {summary?.averageDailyChange ? "histórico real" : "dados simulados"}
          </span>
          <span>🔄 Atualizado automaticamente</span>
          <span>⏱️ Projeção para {forecastDays} dias</span>
          {activeScenarios.length > 0 && (
            <span className="text-purple-600 font-medium">
              🎯 {activeScenarios.length} cenário(s) aplicado(s)
            </span>
          )}
        </div>
      </div>

      {/* Scenario Simulator */}
      <div className="mt-6">
        <CashFlowSimulator
          onSimulate={handleScenarioSimulation}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CashFlowForecast;
