import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

// Configuração do banco usando variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST || "aws-0-sa-east-1.pooler.supabase.com",
  port: parseInt(process.env.DB_PORT) || 6543,
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres.wgfpxpgwwwrouizgpgfi",
  password: process.env.DB_PASSWORD || "Flamengo.019",
  ssl: {
    rejectUnauthorized: false,
  },
});

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

async function addDefaultCategoriesForExistingUser() {
  try {
    console.log("🔍 Buscando usuários existentes...");

    // Buscar usuário existente
    const usersQuery = await pool.query(
      "SELECT id, email FROM auth.users LIMIT 1"
    );

    if (usersQuery.rows.length === 0) {
      console.log("⚠️  Nenhum usuário encontrado");
      return;
    }

    const user = usersQuery.rows[0];
    console.log(`👤 Usuário encontrado: ${user.email} (${user.id})`);

    // Verificar se já tem categorias
    const existingCategories = await pool.query(
      "SELECT COUNT(*) as count FROM categories WHERE user_id = $1",
      [user.id]
    );

    if (parseInt(existingCategories.rows[0].count) > 0) {
      console.log(
        `⚠️  Usuário já possui ${existingCategories.rows[0].count} categorias`
      );
      return;
    }

    console.log("🏷️  Criando categorias padrão...");

    for (const category of defaultCategories) {
      await pool.query(
        "INSERT INTO categories (user_id, name, color, icon, type) VALUES ($1, $2, $3, $4, $5)",
        [user.id, category.name, category.color, category.icon, category.type]
      );
      console.log(`  ✅ ${category.name} (${category.type})`);
    }

    console.log(
      `🎉 ${defaultCategories.length} categorias padrão criadas com sucesso!`
    );
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await pool.end();
  }
}

addDefaultCategoriesForExistingUser();
