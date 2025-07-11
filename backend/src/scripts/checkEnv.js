#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente estão configuradas corretamente
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../../.env') });

console.log('🔍 Verificando Configuração de Variáveis de Ambiente...\n');

// Variáveis obrigatórias do backend
const requiredEnvVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
  'DATABASE_URL': process.env.DATABASE_URL,
  'DB_HOST': process.env.DB_HOST,
  'DB_PORT': process.env.DB_PORT,
  'DB_NAME': process.env.DB_NAME,
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'JWT_SECRET': process.env.JWT_SECRET,
  'CORS_ORIGIN': process.env.CORS_ORIGIN,
  'PORT': process.env.PORT,
  'NODE_ENV': process.env.NODE_ENV
};

let hasErrors = false;

console.log('📋 Status das Variáveis de Ambiente:');
console.log('=====================================\n');

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (key.includes('KEY') || key.includes('PASSWORD') || key.includes('SECRET') ? 
      `${value.substring(0, 10)}...` : value) : 
    'NÃO DEFINIDA';
  
  console.log(`${status} ${key.padEnd(20)}: ${displayValue}`);
  
  if (!value) {
    hasErrors = true;
  }
});

console.log('\n=====================================\n');

if (hasErrors) {
  console.log('❌ ERRO: Algumas variáveis obrigatórias não estão definidas!');
  console.log('📝 Para corrigir:');
  console.log('   1. Verifique se o arquivo .env existe na pasta backend/');
  console.log('   2. Copie o arquivo .env.example se necessário');
  console.log('   3. Configure todas as variáveis obrigatórias');
  console.log('   4. Reinicie o servidor');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
  console.log('🚀 O servidor pode ser iniciado com segurança.');
}

// Teste de conexão básico
console.log('\n🔗 Testando URLs...');

try {
  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  console.log(`✅ SUPABASE_URL válida: ${supabaseUrl.hostname}`);
} catch (error) {
  console.log('❌ SUPABASE_URL inválida:', error.message);
  hasErrors = true;
}

if (process.env.CORS_ORIGIN) {
  try {
    const corsUrl = new URL(process.env.CORS_ORIGIN);
    console.log(`✅ CORS_ORIGIN válida: ${corsUrl.hostname}`);
  } catch (error) {
    console.log('❌ CORS_ORIGIN inválida:', error.message);
  }
}

console.log('\n🔒 Verificação de Segurança:');
if (process.env.JWT_SECRET === 'your_jwt_secret_key') {
  console.log('⚠️  AVISO: JWT_SECRET usando valor padrão. Altere para produção!');
}

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length < 8) {
  console.log('⚠️  AVISO: Senha do banco muito simples. Use senha mais forte!');
}

console.log('\n🎉 Verificação concluída!\n');
