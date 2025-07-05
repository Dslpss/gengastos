import { Pool } from "pg";
import { config } from "../config/index.js";

// Configuração da conexão PostgreSQL
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Número máximo de conexões no pool
  idleTimeoutMillis: 30000, // Timeout para conexões inativas
  connectionTimeoutMillis: 2000, // Timeout para estabelecer conexão
});

// Função para testar conexão
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Conexão PostgreSQL estabelecida:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão PostgreSQL:", error);
    return false;
  }
};

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Função para obter cliente do pool
export const getClient = () => {
  return pool.connect();
};

// Função para fechar todas as conexões
export const closePool = async () => {
  await pool.end();
};

export default pool;
