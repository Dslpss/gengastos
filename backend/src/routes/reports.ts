import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/reports/dashboard
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get dashboard data" });
  })
);

// GET /api/reports/monthly
router.get(
  "/monthly",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get monthly report" });
  })
);

// GET /api/reports/categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get categories report" });
  })
);

// GET /api/reports/forecast
router.get(
  "/forecast",
  asyncHandler(async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const days = parseInt(req.query.days as string) || 30;
    const includeRecurring = req.query.includeRecurring !== "false";

    try {
      // Buscar transações dos últimos 6 meses para análise histórica
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: historicalTransactions, error: transactionsError } =
        await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user_id)
          .gte("date", sixMonthsAgo.toISOString().split("T")[0])
          .order("date", { ascending: true });

      if (transactionsError) throw transactionsError;

      // Buscar transações recorrentes ativas
      let recurringTransactions: any[] = [];
      if (includeRecurring) {
        const { data: recurring, error: recurringError } = await supabase
          .from("recurring_transactions")
          .select("*")
          .eq("user_id", user_id)
          .eq("is_active", true);

        if (recurringError) throw recurringError;
        recurringTransactions = recurring || [];
      }

      // Calcular saldo atual
      const currentBalance =
        historicalTransactions?.reduce((acc, transaction) => {
          return (
            acc +
            (transaction.type === "income"
              ? transaction.amount
              : -transaction.amount)
          );
        }, 0) || 0;

      // Gerar projeções
      const forecast = generateCashFlowForecast(
        historicalTransactions || [],
        recurringTransactions,
        currentBalance,
        days
      );

      res.json({
        currentBalance,
        forecast,
        analysis: {
          totalTransactions: historicalTransactions?.length || 0,
          recurringCount: recurringTransactions.length,
          forecastDays: days,
        },
      });
    } catch (error) {
      console.error("Erro ao gerar previsão:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  })
);

// GET /api/reports/export
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - export data" });
  })
);

// Função para gerar previsão de fluxo de caixa
function generateCashFlowForecast(
  historicalTransactions: any[],
  recurringTransactions: any[],
  currentBalance: number,
  forecastDays: number
) {
  const forecast: any[] = [];
  const today = new Date();
  let runningBalance = currentBalance;

  // Calcular médias históricas por tipo e frequência
  const monthlyAverages = calculateMonthlyAverages(historicalTransactions);

  for (let i = 0; i <= forecastDays; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    let dailyChange = 0;

    // Adicionar transações recorrentes que caem nesta data
    recurringTransactions.forEach((recurring) => {
      if (shouldExecuteRecurring(recurring, currentDate)) {
        dailyChange +=
          recurring.type === "income" ? recurring.amount : -recurring.amount;
      }
    });

    // Adicionar estimativa baseada em média histórica (distribuída ao longo do mês)
    const dailyHistoricalEstimate =
      (monthlyAverages.totalIncome - monthlyAverages.totalExpenses) / 30;
    dailyChange += dailyHistoricalEstimate;

    runningBalance += dailyChange;

    forecast.push({
      date: currentDate.toISOString().split("T")[0],
      balance: Math.round(runningBalance * 100) / 100,
      change: Math.round(dailyChange * 100) / 100,
      type: i === 0 ? "current" : "projected",
    });
  }

  return forecast;
}

function calculateMonthlyAverages(transactions: any[]) {
  if (transactions.length === 0) {
    return { totalIncome: 0, totalExpenses: 0 };
  }

  const monthlyData: { [key: string]: { income: number; expenses: number } } =
    {};

  transactions.forEach((transaction) => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }

    if (transaction.type === "income") {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expenses += transaction.amount;
    }
  });

  const months = Object.keys(monthlyData);
  if (months.length === 0) {
    return { totalIncome: 0, totalExpenses: 0 };
  }

  const totalIncome =
    Object.values(monthlyData).reduce((acc, month) => acc + month.income, 0) /
    months.length;
  const totalExpenses =
    Object.values(monthlyData).reduce((acc, month) => acc + month.expenses, 0) /
    months.length;

  return { totalIncome, totalExpenses };
}

function shouldExecuteRecurring(recurring: any, targetDate: Date): boolean {
  const nextDate = new Date(recurring.next_date);
  const targetDateStr = targetDate.toISOString().split("T")[0];
  const nextDateStr = nextDate.toISOString().split("T")[0];

  if (targetDateStr === nextDateStr) {
    return true;
  }

  // Para transações mensais, verificar se é o mesmo dia do mês
  if (recurring.frequency === "monthly") {
    const targetDay = targetDate.getDate();
    const recurringDay = nextDate.getDate();

    if (targetDay === recurringDay && targetDate >= nextDate) {
      return true;
    }
  }

  return false;
}

export default router;
