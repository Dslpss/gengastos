import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  date: string;
  type: "income" | "expense";
  payment_method: "cash" | "credit_card" | "debit_card" | "pix" | "transfer";
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface UserSettings {
  id: string;
  user_id: string;
  salary: number;
  bonus_balance: number;
  investment_balance: number;
  sales_balance: number;
  other_balance: number;
  total_extra_balance: number;
  created_at: string;
  updated_at: string;
}

class SupabaseApiService {
  private async getCurrentUser(): Promise<User> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("Usuário não autenticado");
    }
    return user;
  }

  // User Settings
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const user = await this.getCurrentUser();

      // Primeiro, tenta buscar as configurações existentes
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle() ao invés de single()

      if (error) {
        console.error("Erro ao buscar configurações:", error);
        return null;
      }

      // Se não encontrou configurações, retorna null
      // Não tenta criar automaticamente aqui para evitar conflitos
      return data;
    } catch (err) {
      console.error("Erro ao processar getUserSettings:", err);
      return null;
    }
  }

  async upsertUserSettings(salary: number): Promise<UserSettings | null> {
    try {
      const user = await this.getCurrentUser();

      // Usar upsert com merge para evitar conflitos
      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            salary,
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar/atualizar configurações:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Erro ao processar upsertUserSettings:", err);
      return null;
    }
  }

  async updateExtraBalances(balances: {
    bonus_balance?: number;
    investment_balance?: number;
    sales_balance?: number;
    other_balance?: number;
  }): Promise<UserSettings | null> {
    try {
      const user = await this.getCurrentUser();

      // Primeiro buscar as configurações existentes
      const currentSettings = await this.getUserSettings();

      if (!currentSettings) {
        // Se não existem configurações, criar com os saldos extras
        const { data, error } = await supabase
          .from("user_settings")
          .insert([
            {
              user_id: user.id,
              salary: 0,
              bonus_balance: balances.bonus_balance || 0,
              investment_balance: balances.investment_balance || 0,
              sales_balance: balances.sales_balance || 0,
              other_balance: balances.other_balance || 0,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error(
            "Erro ao criar configurações com saldos extras:",
            error
          );
          return null;
        }

        return data;
      } else {
        // Atualizar configurações existentes
        const { data, error } = await supabase
          .from("user_settings")
          .update(balances)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Erro ao atualizar saldos extras:", error);
          return null;
        }

        return data;
      }
    } catch (err) {
      console.error("Erro ao processar updateExtraBalances:", err);
      return null;
    }
  }

  async updateAllUserSettings(settings: {
    salary?: number;
    bonus_balance?: number;
    investment_balance?: number;
    sales_balance?: number;
    other_balance?: number;
  }): Promise<UserSettings | null> {
    try {
      const user = await this.getCurrentUser();

      // Usar upsert para criar ou atualizar
      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            ...settings,
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar/atualizar todas as configurações:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Erro ao processar updateAllUserSettings:", err);
      return null;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createCategory(categoryData: {
    name: string;
    color: string;
    icon: string;
    type: "income" | "expense";
  }): Promise<Category> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          ...categoryData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateCategory(
    id: string,
    categoryData: {
      name: string;
      color: string;
      icon: string;
      type: "income" | "expense";
    }
  ): Promise<Category> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const user = await this.getCurrentUser();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  }

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    category_id?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const user = await this.getCurrentUser();

    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .eq("user_id", user.id);

    // Apply filters
    if (params?.category_id) {
      query = query.eq("category_id", params.category_id);
    }

    if (params?.month && params?.year) {
      const startDate = new Date(params.year, params.month - 1, 1);
      const endDate = new Date(params.year, params.month, 0);
      query = query
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);
    }

    // Apply pagination
    const limit = params?.limit || 50;
    const page = params?.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order("date", { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      transactions: data || [],
      total: count || 0,
    };
  }

  async createTransaction(transactionData: {
    category_id: string;
    amount: number;
    description?: string;
    date: string;
    type: "income" | "expense";
    payment_method: "cash" | "credit_card" | "debit_card" | "pix" | "transfer";
  }): Promise<Transaction> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          ...transactionData,
          user_id: user.id,
          description: transactionData.description || null,
        },
      ])
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateTransaction(
    id: string,
    transactionData: {
      category_id: string;
      amount: number;
      description?: string;
      date: string;
      type: "income" | "expense";
      payment_method:
        | "cash"
        | "credit_card"
        | "debit_card"
        | "pix"
        | "transfer";
    }
  ): Promise<Transaction> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("transactions")
      .update({
        ...transactionData,
        description: transactionData.description || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTransaction(id: string): Promise<void> {
    const user = await this.getCurrentUser();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  }

  // Dashboard Summary
  async getDashboardSummary(
    month?: number,
    year?: number
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
    topCategories: Array<{ category: string; amount: number; count: number }>;
  }> {
    const user = await this.getCurrentUser();

    let query = supabase
      .from("transactions")
      .select(
        `
        amount,
        type,
        category:categories(name)
      `
      )
      .eq("user_id", user.id);

    // Apply date filter if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
        topCategories: [],
      };
    }

    // Calculate summary
    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Calculate top categories
    const categoryMap = new Map<string, { amount: number; count: number }>();

    data.forEach((transaction) => {
      const categoryName =
        (transaction.category as any)?.name || "Sem categoria";
      const current = categoryMap.get(categoryName) || { amount: 0, count: 0 };

      categoryMap.set(categoryName, {
        amount: current.amount + transaction.amount,
        count: current.count + 1,
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: data.length,
      topCategories,
    };
  }

  // Budgets
  async getBudgets(month?: number, year?: number): Promise<Budget[]> {
    const user = await this.getCurrentUser();

    let query = supabase
      .from("budgets")
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .eq("user_id", user.id);

    if (month && year) {
      query = query.eq("month", month).eq("year", year);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw new Error(error.message);

    // Calcular valor gasto para cada orçamento
    const budgetsWithSpent = await Promise.all(
      (data || []).map(async (budget) => {
        // Buscar transações da categoria no período do orçamento
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .eq("category_id", budget.category_id)
          .gte(
            "date",
            `${budget.year}-${budget.month.toString().padStart(2, "0")}-01`
          )
          .lte(
            "date",
            `${budget.year}-${budget.month.toString().padStart(2, "0")}-31`
          );

        const spent =
          transactions?.reduce((sum, transaction) => {
            return transaction.type === "expense"
              ? sum + transaction.amount
              : sum;
          }, 0) || 0;

        return {
          ...budget,
          spent,
        };
      })
    );

    return budgetsWithSpent;
  }

  async createBudget(budgetData: {
    category_id: string;
    amount: number;
    month: number;
    year: number;
  }): Promise<Budget> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("budgets")
      .insert([
        {
          ...budgetData,
          user_id: user.id,
        },
      ])
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateBudget(
    id: string,
    budgetData: {
      category_id?: string;
      amount?: number;
      month?: number;
      year?: number;
    }
  ): Promise<Budget> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from("budgets")
      .update(budgetData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteBudget(id: string): Promise<void> {
    const user = await this.getCurrentUser();

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  }

  // Initialize default categories
  async createDefaultCategories(): Promise<void> {
    const user = await this.getCurrentUser();

    // Check if user already has categories
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      return; // User already has categories
    }

    const defaultCategories = [
      // Expense categories
      { name: "Alimentação", icon: "🍔", color: "#EF4444", type: "expense" },
      { name: "Transporte", icon: "🚗", color: "#F59E0B", type: "expense" },
      { name: "Moradia", icon: "🏠", color: "#8B5CF6", type: "expense" },
      { name: "Saúde", icon: "💊", color: "#EC4899", type: "expense" },
      { name: "Educação", icon: "📚", color: "#3B82F6", type: "expense" },
      { name: "Lazer", icon: "🎮", color: "#10B981", type: "expense" },
      { name: "Roupas", icon: "👕", color: "#F97316", type: "expense" },
      { name: "Tecnologia", icon: "📱", color: "#6366F1", type: "expense" },
      { name: "Serviços", icon: "🔧", color: "#84CC16", type: "expense" },
      { name: "Outros", icon: "📝", color: "#6B7280", type: "expense" },

      // Income categories
      { name: "Salário", icon: "💰", color: "#059669", type: "income" },
      { name: "Freelance", icon: "💼", color: "#0D9488", type: "income" },
      { name: "Investimentos", icon: "📈", color: "#7C3AED", type: "income" },
      { name: "Vendas", icon: "🏪", color: "#DC2626", type: "income" },
      { name: "Outros", icon: "💎", color: "#059669", type: "income" },
    ];

    const categoriesToInsert = defaultCategories.map((cat) => ({
      ...cat,
      user_id: user.id,
      type: cat.type as "income" | "expense",
    }));

    const { error } = await supabase
      .from("categories")
      .insert(categoriesToInsert);

    if (error) throw new Error(error.message);
  }

  // Notification System
  async checkBudgetOverage(categoryId: string, amount: number) {
    const user = await this.getCurrentUser();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Buscar orçamento para a categoria
    const { data: budget } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    if (!budget) return null;

    // Calcular gasto total da categoria no mês
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .eq("type", "expense")
      .gte(
        "date",
        `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`
      )
      .lt(
        "date",
        `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`
      );

    const totalSpent = (transactions || []).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const newTotal = totalSpent + amount;

    if (newTotal > budget.amount) {
      return {
        type: "budget_exceeded" as const,
        title: "🚨 Orçamento Estourado!",
        message: `Categoria "${budget.category.name}": R$ ${newTotal.toFixed(
          2
        )} de R$ ${budget.amount.toFixed(2)}`,
        icon: "⚠️",
        data: { categoryId, budgetAmount: budget.amount, totalSpent: newTotal },
      };
    }

    return null;
  }

  async checkLowBalance(currentBalance: number) {
    // Buscar configurações do usuário para definir um threshold inteligente
    const settings = await this.getUserSettings();

    if (!settings || settings.salary <= 0) {
      // Se não há salário definido, usar valor fixo baixo
      const threshold = 100;
      if (currentBalance < threshold) {
        return {
          type: "low_balance" as const,
          title: "💰 Saldo Baixo",
          message: `Seu saldo está baixo: R$ ${currentBalance.toFixed(
            2
          )}. Considere revisar seus gastos.`,
          icon: "⚠️",
          data: { balance: currentBalance, threshold },
        };
      }
      return null;
    }

    // Usar 10% do salário como threshold mínimo (ou R$ 200, o que for maior)
    const salaryThreshold = settings.salary * 0.1;
    const threshold = Math.max(salaryThreshold, 200);

    if (currentBalance < threshold) {
      return {
        type: "low_balance" as const,
        title: "💰 Saldo Baixo",
        message: `Seu saldo está baixo: R$ ${currentBalance.toFixed(
          2
        )}. Meta recomendada: R$ ${threshold.toFixed(2)} (10% do salário).`,
        icon: "⚠️",
        data: { balance: currentBalance, threshold, salaryBased: true },
      };
    }

    return null;
  }

  async checkUnusualTransaction(amount: number, type: "income" | "expense") {
    const user = await this.getCurrentUser();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar transações dos últimos 30 dias do mesmo tipo
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", type)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    if (!recentTransactions || recentTransactions.length < 5) return null;

    // Calcular média das transações
    const average =
      recentTransactions.reduce((sum, t) => sum + t.amount, 0) /
      recentTransactions.length;
    const threshold = average * 3; // 3x a média

    if (amount > threshold) {
      const typeText = type === "expense" ? "gasto" : "receita";
      return {
        type: "unusual_transaction" as const,
        title: `🤔 ${type === "expense" ? "Gasto" : "Receita"} Incomum`,
        message: `Este ${typeText} de R$ ${amount.toFixed(
          2
        )} é muito acima da sua média (R$ ${average.toFixed(2)}).`,
        icon: "🧐",
        data: { amount, average, type },
      };
    }

    return null;
  }

  async checkUpcomingBills() {
    // Esta seria uma funcionalidade mais avançada que requereria
    // uma tabela de contas recorrentes. Por enquanto, retorna exemplo
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Simulação: avisar próximo ao dia 25 (exemplo: aluguel)
    if (dayOfMonth >= 23 && dayOfMonth <= 25) {
      return {
        type: "upcoming_bill" as const,
        title: "📅 Lembrete de Conta",
        message:
          "Lembre-se: algumas contas importantes vencem no final do mês!",
        icon: "⏰",
        data: { day: dayOfMonth },
      };
    }

    return null;
  }

  // Função para calcular o saldo real atual baseado no banco de dados
  async calculateCurrentBalance() {
    const user = await this.getCurrentUser();

    // 1. Buscar configurações do usuário (salário + extras)
    const settings = await this.getUserSettings();
    const initialBalance = settings
      ? settings.salary + (settings.total_extra_balance || 0)
      : 0;

    // 2. Buscar todas as transações
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id);

    if (!transactions) return initialBalance;

    // 3. Calcular saldo atual
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return initialBalance + totalIncome - totalExpenses;
  }

  // Função inteligente para verificar todas as notificações baseadas no banco
  async checkAllNotifications() {
    try {
      const notifications = [];

      // 1. Verificar saldo baixo com dados reais
      const currentBalance = await this.calculateCurrentBalance();
      const lowBalanceAlert = await this.checkLowBalance(currentBalance);
      if (lowBalanceAlert) notifications.push(lowBalanceAlert);

      // 2. Verificar contas próximas do vencimento
      const upcomingBillAlert = await this.checkUpcomingBills();
      if (upcomingBillAlert) notifications.push(upcomingBillAlert);

      // 3. Verificar orçamentos estourados (para todas as categorias)
      const user = await this.getCurrentUser();
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Buscar todos os orçamentos do mês atual
      const { data: budgets } = await supabase
        .from("budgets")
        .select("*, category:categories(*)")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear);

      if (budgets) {
        for (const budget of budgets) {
          // Calcular gasto total da categoria no mês
          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("category_id", budget.category_id)
            .eq("type", "expense")
            .gte(
              "date",
              `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`
            )
            .lt(
              "date",
              `${currentYear}-${(currentMonth + 1)
                .toString()
                .padStart(2, "0")}-01`
            );

          const totalSpent = (transactions || []).reduce(
            (sum, t) => sum + t.amount,
            0
          );

          if (totalSpent > budget.amount) {
            notifications.push({
              type: "budget_exceeded" as const,
              title: "🚨 Orçamento Estourado!",
              message: `Categoria "${
                budget.category.name
              }": R$ ${totalSpent.toFixed(2)} de R$ ${budget.amount.toFixed(
                2
              )}`,
              icon: "⚠️",
              data: {
                categoryId: budget.category_id,
                budgetAmount: budget.amount,
                totalSpent,
              },
            });
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
      return [];
    }
  }

  // Cash Flow Forecast
  async getCashFlowForecast(
    days: number = 30,
    includeRecurring: boolean = true
  ): Promise<any> {
    try {
      const user = await this.getCurrentUser();

      // Como não temos backend funcionando ainda, vamos simular dados
      // Em produção, isso faria uma chamada para o backend
      const response = await fetch(
        `/api/reports/forecast?days=${days}&includeRecurring=${includeRecurring}`,
        {
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar previsão");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar previsão de fluxo de caixa:", error);

      // Fallback: gerar dados simulados para demonstração
      return this.generateMockForecast(days);
    }
  }

  private async generateMockForecast(days: number) {
    try {
      const user = await this.getCurrentUser();

      // Buscar transações reais para base de cálculo
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      // Calcular saldo atual baseado em transações
      const currentBalance =
        transactions?.reduce((acc, t) => {
          return acc + (t.type === "income" ? t.amount : -t.amount);
        }, 0) || 1000; // Valor padrão se não houver transações

      // Gerar projeção simulada
      const forecast = [];
      const today = new Date();
      let runningBalance = currentBalance;

      for (let i = 0; i <= days; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // Simular variação diária baseada em padrão realista
        let dailyChange = 0;

        // Simular receita no início do mês (salário)
        if (currentDate.getDate() === 1) {
          dailyChange += 3000; // Salário simulado
        }

        // Simular gastos aleatórios (mais realistas)
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Dias úteis
          dailyChange -= 50 + Math.random() * 100; // Gastos variados
        } else {
          // Fins de semana
          dailyChange -= 30 + Math.random() * 150; // Gastos de lazer
        }

        runningBalance += dailyChange;

        forecast.push({
          date: currentDate.toISOString().split("T")[0],
          balance: Math.round(runningBalance * 100) / 100,
          change: Math.round(dailyChange * 100) / 100,
          type: i === 0 ? "current" : "projected",
        });
      }

      return {
        currentBalance,
        forecast,
        analysis: {
          totalTransactions: transactions?.length || 0,
          recurringCount: 0,
          forecastDays: days,
        },
      };
    } catch (error) {
      console.error("Erro ao gerar dados simulados:", error);

      // Fallback final com dados estáticos
      const currentBalance = 1000;
      const forecast = Array.from({ length: days + 1 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const balance = currentBalance - i * 25 + (Math.random() * 100 - 50);

        return {
          date: date.toISOString().split("T")[0],
          balance: Math.round(balance * 100) / 100,
          change:
            i === 0 ? 0 : Math.round((Math.random() * 100 - 50) * 100) / 100,
          type: i === 0 ? "current" : "projected",
        };
      });

      return {
        currentBalance,
        forecast,
        analysis: {
          totalTransactions: 0,
          recurringCount: 0,
          forecastDays: days,
        },
      };
    }
  }
}

export const apiService = new SupabaseApiService();
