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
  created_at: string;
  updated_at: string;
  category?: Category;
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
    return data || [];
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
}

export const apiService = new SupabaseApiService();
