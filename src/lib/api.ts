import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiService {
  private async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Usuário não autenticado");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro na requisição");
    }

    return response.json();
  }

  // Categories
  async getCategories() {
    return this.request("/api/categories");
  }

  async createCategory(category: {
    name: string;
    color: string;
    icon: string;
    type: "income" | "expense";
  }) {
    return this.request("/api/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
  }

  async updateCategory(
    id: string,
    category: {
      name: string;
      color: string;
      icon: string;
      type: "income" | "expense";
    }
  ) {
    return this.request(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    category_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return this.request(`/api/transactions${query ? `?${query}` : ""}`);
  }

  async getTransactionsSummary(params?: { month?: number; year?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return this.request(`/api/transactions/summary${query ? `?${query}` : ""}`);
  }

  async createTransaction(transaction: {
    category_id: string;
    amount: number;
    description?: string;
    date: string;
    type: "income" | "expense";
    payment_method: "cash" | "credit_card" | "debit_card" | "pix" | "transfer";
  }) {
    return this.request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(
    id: string,
    transaction: {
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
  ) {
    return this.request(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/api/transactions/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
