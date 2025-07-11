import { ReactNode } from "react";

// Database Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  type: "expense" | "income";
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
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

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: "weekly" | "monthly" | "yearly";
  next_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Form Types
export interface TransactionFormData {
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
  payment_method: "cash" | "credit_card" | "debit_card" | "pix" | "transfer";
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  type: "expense" | "income";
}

export interface BudgetFormData {
  category_id: string;
  amount: number;
  month: number;
  year: number;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface PieChartData {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

// Dashboard Types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyChange: number;
  expensesByCategory: PieChartData[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category_id?: string;
  type?: "expense" | "income" | "all";
  payment_method?: string;
  search?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// Store Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: TransactionFilters) => void;
}

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

// Component Props Types
export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "date" | "tel";
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "small" | "medium" | "large";
}

export interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  padding?: "none" | "small" | "medium" | "large";
}

// Cash Flow Forecast Types
export interface CashFlowForecastPoint {
  date: string;
  balance: number;
  change: number;
  type: "current" | "projected";
}

export interface CashFlowForecastResponse {
  currentBalance: number;
  forecast: CashFlowForecastPoint[];
  analysis: {
    totalTransactions: number;
    recurringCount: number;
    forecastDays: number;
  };
}

export interface ForecastSummary {
  currentBalance: number;
  projectedBalance: number;
  highestBalance: number;
  lowestBalance: number;
  daysUntilNegative: number | null;
  averageDailyChange: number;
}

// Utility Types
export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "pix"
  | "transfer";
export type TransactionType = "expense" | "income";
export type Frequency = "weekly" | "monthly" | "yearly";

// Constants
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "pix", label: "PIX" },
  { value: "transfer", label: "Transferência" },
];

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
];

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

export const DEFAULT_CATEGORIES: Omit<
  Category,
  "id" | "user_id" | "created_at" | "updated_at"
>[] = [
  {
    name: "Alimentação",
    color: "#ef4444",
    icon: "UtensilsCrossed",
    type: "expense",
  },
  { name: "Transporte", color: "#3b82f6", icon: "Car", type: "expense" },
  { name: "Casa", color: "#10b981", icon: "Home", type: "expense" },
  { name: "Saúde", color: "#f59e0b", icon: "Heart", type: "expense" },
  {
    name: "Educação",
    color: "#8b5cf6",
    icon: "GraduationCap",
    type: "expense",
  },
  { name: "Lazer", color: "#06b6d4", icon: "Gamepad2", type: "expense" },
  { name: "Compras", color: "#ec4899", icon: "ShoppingBag", type: "expense" },
  { name: "Salário", color: "#10b981", icon: "DollarSign", type: "income" },
  { name: "Freelance", color: "#3b82f6", icon: "Briefcase", type: "income" },
  {
    name: "Investimentos",
    color: "#f59e0b",
    icon: "TrendingUp",
    type: "income",
  },
];
