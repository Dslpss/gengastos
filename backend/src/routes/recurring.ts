import { Router } from "express";
import pool from "../lib/database.js";
import { supabase, supabaseAuth } from "../lib/supabase.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Middleware para verificar autenticação
const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token de autorização necessário" });
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Token inválido" });
  }

  req.user = user;
  next();
};

// GET /api/recurring
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { rows } = await pool.query(
      `SELECT rt.*, c.name as category_name, c.color as category_color, c.icon as category_icon, c.type as category_type
       FROM recurring_transactions rt
       JOIN categories c ON rt.category_id = c.id
       WHERE rt.user_id = $1 
       ORDER BY rt.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  })
);

// POST /api/recurring
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { category_id, amount, description, frequency, next_date } = req.body;

    if (!category_id || !amount || !frequency || !next_date) {
      return res.status(400).json({
        error: "Campos obrigatórios: category_id, amount, frequency, next_date",
      });
    }

    const { rows } = await pool.query(
      "INSERT INTO recurring_transactions (user_id, category_id, amount, description, frequency, next_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.user.id, category_id, amount, description, frequency, next_date]
    );

    res.status(201).json(rows[0]);
  })
);

// PUT /api/recurring/:id
router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const {
      category_id,
      amount,
      description,
      frequency,
      next_date,
      is_active,
    } = req.body;

    const { rows } = await pool.query(
      "UPDATE recurring_transactions SET category_id = $1, amount = $2, description = $3, frequency = $4, next_date = $5, is_active = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
      [
        category_id,
        amount,
        description,
        frequency,
        next_date,
        is_active,
        id,
        req.user.id,
      ]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    res.json(rows[0]);
  })
);

// DELETE /api/recurring/:id
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(
      "DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    res.json({ message: "Transação recorrente removida com sucesso" });
  })
);

// POST /api/recurring/:id/execute - Executar uma transação recorrente específica
router.post(
  "/:id/execute",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    // Buscar a transação recorrente
    const { rows: recurringRows } = await pool.query(
      "SELECT * FROM recurring_transactions WHERE id = $1 AND user_id = $2 AND is_active = true",
      [id, req.user.id]
    );

    if (recurringRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada ou inativa" });
    }

    const recurring = recurringRows[0];

    // Buscar informações da categoria para determinar o tipo
    const { rows: categoryRows } = await pool.query(
      "SELECT type FROM categories WHERE id = $1",
      [recurring.category_id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const categoryType = categoryRows[0].type;

    // Criar a transação
    const { rows: transactionRows } = await pool.query(
      "INSERT INTO transactions (user_id, category_id, amount, description, date, type, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        req.user.id,
        recurring.category_id,
        recurring.amount,
        recurring.description || "Transação recorrente",
        new Date().toISOString().split("T")[0],
        categoryType,
        "transfer", // Método padrão para transações recorrentes
      ]
    );

    // Calcular próxima data
    let nextDate = new Date(recurring.next_date);
    switch (recurring.frequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    // Atualizar próxima data da transação recorrente
    await pool.query(
      "UPDATE recurring_transactions SET next_date = $1 WHERE id = $2",
      [nextDate.toISOString().split("T")[0], id]
    );

    res.json({
      transaction: transactionRows[0],
      nextDate: nextDate.toISOString().split("T")[0],
      message: "Transação recorrente executada com sucesso",
    });
  })
);

// GET /api/recurring/pending - Buscar transações recorrentes que devem ser executadas hoje
router.get(
  "/pending",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const today = new Date().toISOString().split("T")[0];

    const { rows } = await pool.query(
      `SELECT rt.*, c.name as category_name, c.color as category_color, c.icon as category_icon, c.type as category_type
       FROM recurring_transactions rt
       JOIN categories c ON rt.category_id = c.id
       WHERE rt.user_id = $1 AND rt.is_active = true AND rt.next_date <= $2
       ORDER BY rt.next_date ASC`,
      [req.user.id, today]
    );

    res.json(rows);
  })
);

export default router;
