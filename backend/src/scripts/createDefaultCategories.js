import dotenv from "dotenv";
import pool from "../lib/database.js";

dotenv.config();

const defaultCategories = [
  // Categorias de Despesa
  { name: "Alimentação", color: "#EF4444", icon: "🍔", type: "expense" },
  { name: "Transporte", color: "#3B82F6", icon: "🚗", type: "expense" },
  { name: "Moradia", color: "#10B981", icon: "🏠", type: "expense" },
  { name: "Saúde", color: "#F59E0B", icon: "💊", type: "expense" },
  { name: "Educação", color: "#8B5CF6", icon: "📚", type: "expense" },
  { name: "Lazer", color: "#EC4899", icon: "🎮", type: "expense" },
  { name: "Vestuário", color: "#06B6D4", icon: "👕", type: "expense" },
  { name: "Outros", color: "#6B7280", icon: "📝", type: "expense" },

  // Categorias de Receita
  { name: "Salário", color: "#10B981", icon: "💰", type: "income" },
  { name: "Freelance", color: "#3B82F6", icon: "💼", type: "income" },
  { name: "Investimentos", color: "#8B5CF6", icon: "📊", type: "income" },
  { name: "Outros", color: "#6B7280", icon: "💡", type: "income" },
];

async function createDefaultCategories(userId) {
  try {
    console.log(`🏷️  Criando categorias padrão para usuário ${userId}...`);

    for (const category of defaultCategories) {
      await pool.query(
        "INSERT INTO categories (user_id, name, color, icon, type) VALUES ($1, $2, $3, $4, $5)",
        [userId, category.name, category.color, category.icon, category.type]
      );
    }

    console.log(
      `✅ ${defaultCategories.length} categorias padrão criadas com sucesso!`
    );
  } catch (error) {
    console.error("❌ Erro ao criar categorias padrão:", error);
    throw error;
  }
}

export { createDefaultCategories, defaultCategories };
