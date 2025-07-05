import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco usando as credenciais fornecidas
const pool = new Pool({
  host: "aws-0-sa-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.wgfpxpgwwwrouizgpgfi",
  password: "Flamengo.019",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDatabase() {
  try {
    console.log("🔗 Conectando ao banco de dados...");

    // Testar conexão
    const testQuery = await pool.query("SELECT NOW() as current_time");
    console.log("✅ Conexão estabelecida:", testQuery.rows[0].current_time);

    // Verificar se as tabelas já existem
    console.log("📋 Verificando tabelas existentes...");
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categories', 'transactions', 'budgets')
    `);

    console.log(
      "📊 Tabelas encontradas:",
      tablesQuery.rows.map((row) => row.table_name)
    );

    // Ler e executar o schema
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    if (fs.existsSync(schemaPath)) {
      console.log("📄 Executando schema.sql...");
      const schema = fs.readFileSync(schemaPath, "utf8");
      await pool.query(schema);
      console.log("✅ Schema executado com sucesso!");
    } else {
      console.log("⚠️  Arquivo schema.sql não encontrado em:", schemaPath);
    }

    // Verificar tabelas após a criação
    console.log("📋 Verificando tabelas após criação...");
    const finalTablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categories', 'transactions', 'budgets')
    `);

    console.log(
      "📊 Tabelas finais:",
      finalTablesQuery.rows.map((row) => row.table_name)
    );

    // Verificar se há usuários na tabela auth.users (Supabase)
    console.log("👥 Verificando usuários na tabela auth.users...");
    try {
      const usersQuery = await pool.query(
        "SELECT id, email, created_at FROM auth.users LIMIT 5"
      );
      console.log("👤 Usuários encontrados:", usersQuery.rows.length);
      if (usersQuery.rows.length > 0) {
        console.log("📋 Primeiros usuários:");
        usersQuery.rows.forEach((user) => {
          console.log(`  - ${user.email} (${user.id})`);
        });
      }
    } catch (error) {
      console.log("⚠️  Erro ao acessar auth.users:", error.message);
    }

    console.log("✅ Setup do banco concluído!");
  } catch (error) {
    console.error("❌ Erro no setup do banco:", error);
  } finally {
    await pool.end();
  }
}

// Executar o setup
setupDatabase();
