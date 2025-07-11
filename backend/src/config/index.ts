import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceKey: process.env.SUPABASE_SERVICE_KEY || "",
  },
  database: {
    url: process.env["DATABASE_URL"] || "",
    host: process.env["DB_HOST"] || "your-db-host",
    port: parseInt(process.env["DB_PORT"] || "6543"),
    name: process.env["DB_NAME"] || "postgres",
    user: process.env["DB_USER"] || "your-db-user",
    password: process.env["DB_PASSWORD"] || "",
  },
  jwt: {
    secret: process.env["JWT_SECRET"] || "your-secret-key",
  },
} as const;

// Validate required environment variables
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "DB_PASSWORD"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
