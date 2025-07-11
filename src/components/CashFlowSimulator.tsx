import React, { useState } from "react";
import { PlusCircle, MinusCircle, Calculator, RefreshCw } from "lucide-react";

interface ScenarioSimulation {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  frequency: "once" | "weekly" | "monthly";
}

interface CashFlowSimulatorProps {
  onSimulate: (scenarios: ScenarioSimulation[]) => void;
  className?: string;
}

const CashFlowSimulator: React.FC<CashFlowSimulatorProps> = ({
  onSimulate,
  className = "",
}) => {
  const [scenarios, setScenarios] = useState<ScenarioSimulation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newScenario, setNewScenario] = useState<
    Omit<ScenarioSimulation, "id">
  >({
    description: "",
    amount: 0,
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    frequency: "once",
  });

  const addScenario = () => {
    if (!newScenario.description || newScenario.amount <= 0) {
      return;
    }

    const scenario: ScenarioSimulation = {
      ...newScenario,
      id: Date.now().toString(),
    };

    setScenarios([...scenarios, scenario]);
    setNewScenario({
      description: "",
      amount: 0,
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      frequency: "once",
    });
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const clearScenarios = () => {
    setScenarios([]);
    onSimulate([]);
  };

  const handleSimulate = () => {
    onSimulate(scenarios);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTotalImpact = () => {
    return scenarios.reduce((total, scenario) => {
      const multiplier =
        scenario.frequency === "monthly"
          ? 30
          : scenario.frequency === "weekly"
          ? 4
          : 1;
      return (
        total +
        (scenario.type === "income" ? scenario.amount : -scenario.amount) *
          multiplier
      );
    }, 0);
  };

  if (!isExpanded) {
    return (
      <div
        className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-3 sm:p-4 ${className}`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 text-purple-700 hover:text-purple-800 font-medium w-full"
        >
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">🎯 Simular Cenários Futuros</span>
          <PlusCircle className="h-4 w-4 flex-shrink-0 ml-auto" />
        </button>
        <p className="text-xs sm:text-sm text-purple-600 mt-1">
          Adicione receitas ou despesas hipotéticas para ver o impacto na sua
          previsão
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-purple-200 p-4 sm:p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            Simulador de Cenários
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>      {/* Add New Scenario Form */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
        <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Adicionar Cenário</h4>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Descrição (ex: Bonus anual)"
            value={newScenario.description}
            onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Valor"
              value={newScenario.amount || ''}
              onChange={(e) => setNewScenario({ ...newScenario, amount: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
            
            <select
              value={newScenario.type}
              onChange={(e) => setNewScenario({ ...newScenario, type: e.target.value as 'income' | 'expense' })}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={newScenario.frequency}
              onChange={(e) => setNewScenario({ ...newScenario, frequency: e.target.value as 'once' | 'weekly' | 'monthly' })}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="once">Uma vez</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
            
            <input
              type="date"
              value={newScenario.date}
              onChange={(e) => setNewScenario({ ...newScenario, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <button
            onClick={addScenario}
            disabled={!newScenario.description || newScenario.amount <= 0}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Scenarios List */}
      {scenarios.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Cenários Simulados</h4>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        scenario.type === "income"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium">{scenario.description}</span>
                    <span className="text-sm text-gray-500">
                      (
                      {scenario.frequency === "once"
                        ? "uma vez"
                        : scenario.frequency === "weekly"
                        ? "semanal"
                        : "mensal"}
                      )
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(scenario.amount)} •{" "}
                    {new Date(scenario.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <button
                  onClick={() => removeScenario(scenario.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <MinusCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Impact Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                Impacto Total Estimado:
              </span>
              <span
                className={`font-bold text-lg ${
                  getTotalImpact() >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {getTotalImpact() >= 0 ? "+" : ""}
                {formatCurrency(getTotalImpact())}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              * Valores recorrentes são calculados para 30 dias
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSimulate}
          disabled={scenarios.length === 0}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Calculator className="h-4 w-4" />
          <span>Aplicar Simulação</span>
        </button>

        {scenarios.length > 0 && (
          <button
            onClick={clearScenarios}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs sm:text-sm text-yellow-800">
          💡 <strong>Dica:</strong> Use este simulador para testar "e se"
          cenários, como receber um bônus, fazer uma compra grande, ou adicionar
          uma renda extra.
        </p>
      </div>
    </div>
  );
};

export default CashFlowSimulator;
