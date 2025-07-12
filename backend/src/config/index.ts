import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceKey: process.env.SUPABASE_SERVICE_KEY || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
  },
  database: {
    url: process.env["DATABASE_URL"] || "",
    host: process.env["DB_HOST"] || "aws-0-sa-east-1.pooler.supabase.com",
    port: parseInt(process.env["DB_PORT"] || "6543"),
    name: process.env["DB_NAME"] || "postgres",
    user: process.env["DB_USER"] || "postgres.wgfpxpgwwwrouizgpgfi",
    password: process.env["DB_PASSWORD"] || "Flamengo.019",
  },
  jwt: {
    secret: process.env["JWT_SECRET"] || "your-secret-key",
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_ANON_KEY",
  "DB_PASSWORD",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
