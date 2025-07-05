#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Supabase
 * Este script executa o schema SQL no banco de dados
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log("🔄 Configurando banco de dados...");

    // Ler o arquivo schema.sql
    const schemaPath = join(__dirname, "..", "database", "schema.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Executar o schema
    console.log("📝 Executando schema SQL...");
    const { error } = await supabase.rpc("exec_sql", { sql: schemaSQL });

    if (error) {
      console.error("❌ Erro ao executar schema:", error);
      process.exit(1);
    }

    console.log("✅ Schema executado com sucesso!");
    console.log("🎉 Banco de dados configurado com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
