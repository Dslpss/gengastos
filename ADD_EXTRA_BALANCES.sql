-- Atualizar tabela user_settings para incluir saldos extras
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas para saldos extras na tabela user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS bonus_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS investment_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_extra_balance DECIMAL(12,2) DEFAULT 0;

-- 2. Criar função para calcular saldo total automaticamente
CREATE OR REPLACE FUNCTION calculate_total_extra_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_extra_balance = COALESCE(NEW.bonus_balance, 0) + 
                             COALESCE(NEW.investment_balance, 0) + 
                             COALESCE(NEW.sales_balance, 0) + 
                             COALESCE(NEW.other_balance, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Criar trigger para calcular saldo total automaticamente
DROP TRIGGER IF EXISTS calculate_extra_balance_trigger ON user_settings;
CREATE TRIGGER calculate_extra_balance_trigger
    BEFORE INSERT OR UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_extra_balance();

-- 4. Atualizar registros existentes para calcular o saldo total
UPDATE user_settings 
SET total_extra_balance = COALESCE(bonus_balance, 0) + 
                         COALESCE(investment_balance, 0) + 
                         COALESCE(sales_balance, 0) + 
                         COALESCE(other_balance, 0);

-- 5. Verificar a estrutura atualizada
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
