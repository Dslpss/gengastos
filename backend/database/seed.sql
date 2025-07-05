-- Inserir dados de exemplo para desenvolvimento
-- Este arquivo contém dados de exemplo para testes

-- Nota: Estas inserções devem ser feitas após ter usuários criados
-- As UUIDs dos usuários devem ser substituídas pelas UUIDs reais

-- Exemplo de categorias (substitua user_id pelas UUIDs reais)
/*
INSERT INTO categories (user_id, name, color, icon, type) VALUES
('user-uuid-here', 'Alimentação', '#ef4444', 'UtensilsCrossed', 'expense'),
('user-uuid-here', 'Transporte', '#3b82f6', 'Car', 'expense'),
('user-uuid-here', 'Casa', '#10b981', 'Home', 'expense'),
('user-uuid-here', 'Saúde', '#f59e0b', 'Heart', 'expense'),
('user-uuid-here', 'Educação', '#8b5cf6', 'GraduationCap', 'expense'),
('user-uuid-here', 'Lazer', '#06b6d4', 'Gamepad2', 'expense'),
('user-uuid-here', 'Compras', '#ec4899', 'ShoppingBag', 'expense'),
('user-uuid-here', 'Salário', '#10b981', 'DollarSign', 'income'),
('user-uuid-here', 'Freelance', '#3b82f6', 'Briefcase', 'income'),
('user-uuid-here', 'Investimentos', '#f59e0b', 'TrendingUp', 'income');

-- Exemplo de transações
INSERT INTO transactions (user_id, category_id, amount, description, date, type, payment_method) VALUES
('user-uuid-here', 'category-uuid-alimentacao', 150.00, 'Supermercado ABC', '2024-01-15', 'expense', 'debit_card'),
('user-uuid-here', 'category-uuid-transporte', 80.00, 'Combustível', '2024-01-14', 'expense', 'credit_card'),
('user-uuid-here', 'category-uuid-salario', 3000.00, 'Salário mensal', '2024-01-01', 'income', 'transfer'),
('user-uuid-here', 'category-uuid-alimentacao', 45.00, 'Restaurante', '2024-01-13', 'expense', 'cash'),
('user-uuid-here', 'category-uuid-casa', 1200.00, 'Aluguel', '2024-01-01', 'expense', 'transfer');

-- Exemplo de orçamentos
INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES
('user-uuid-here', 'category-uuid-alimentacao', 500.00, 1, 2024),
('user-uuid-here', 'category-uuid-transporte', 300.00, 1, 2024),
('user-uuid-here', 'category-uuid-casa', 1500.00, 1, 2024),
('user-uuid-here', 'category-uuid-lazer', 200.00, 1, 2024);

-- Exemplo de transações recorrentes
INSERT INTO recurring_transactions (user_id, category_id, amount, description, frequency, next_date) VALUES
('user-uuid-here', 'category-uuid-salario', 3000.00, 'Salário mensal', 'monthly', '2024-02-01'),
('user-uuid-here', 'category-uuid-casa', 1200.00, 'Aluguel', 'monthly', '2024-02-01'),
('user-uuid-here', 'category-uuid-casa', 150.00, 'Conta de luz', 'monthly', '2024-02-05');
*/
