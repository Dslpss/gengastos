import { Router } from "express";
import pool from "../lib/database.js";
import { supabase } from "../lib/supabase.js";
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
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Token inválido" });
  }

  req.user = user;
  next();
};

// GET /api/transactions
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { page = 1, limit = 10, month, year, category_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    const params: any[] = [req.user.id];
    let paramIndex = 2;

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM t.date) = $${paramIndex} AND EXTRACT(YEAR FROM t.date) = $${
        paramIndex + 1
      }`;
      params.push(month, year);
      paramIndex += 2;
    }

    if (category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.user_id = $1
      ${
        month && year
          ? "AND EXTRACT(MONTH FROM t.date) = $2 AND EXTRACT(YEAR FROM t.date) = $3"
          : ""
      }
      ${category_id ? `AND t.category_id = $${month && year ? "4" : "2"}` : ""}
    `;

    const countParams = [req.user.id];
    if (month && year) countParams.push(month, year);
    if (category_id) countParams.push(category_id);

    const { rows: countRows } = await pool.query(countQuery, countParams);
    const total = parseInt(countRows[0].total);

    res.json({
      transactions: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// GET /api/transactions/summary
router.get(
  "/summary",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { month, year } = req.query;

    let query = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1
    `;

    const params: any[] = [req.user.id];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`;
      params.push(month, year);
    }

    query += ` GROUP BY type`;

    const { rows } = await pool.query(query, params);

    const summary = {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0,
    };

    rows.forEach((row) => {
      if (row.type === "income") {
        summary.income = parseFloat(row.total);
      } else if (row.type === "expense") {
        summary.expense = parseFloat(row.total);
      }
      summary.transactions += parseInt(row.count);
    });

    summary.balance = summary.income - summary.expense;

    res.json(summary);
  })
);

// POST /api/transactions
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { category_id, amount, description, date, type, payment_method } =
      req.body;

    if (!category_id || !amount || !date || !type || !payment_method) {
      return res
        .status(400)
        .json({
          error:
            "Campos obrigatórios: category_id, amount, date, type, payment_method",
        });
    }

    const { rows } = await pool.query(
      "INSERT INTO transactions (user_id, category_id, amount, description, date, type, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        req.user.id,
        category_id,
        amount,
        description,
        date,
        type,
        payment_method,
      ]
    );

    res.status(201).json(rows[0]);
  })
);

// PUT /api/transactions/:id
router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const { category_id, amount, description, date, type, payment_method } =
      req.body;

    const { rows } = await pool.query(
      "UPDATE transactions SET category_id = $1, amount = $2, description = $3, date = $4, type = $5, payment_method = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
      [
        category_id,
        amount,
        description,
        date,
        type,
        payment_method,
        id,
        req.user.id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    res.json(rows[0]);
  })
);

// DELETE /api/transactions/:id
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    res.json({ message: "Transação removida com sucesso" });
  })
);

export default router;
