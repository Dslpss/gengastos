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

// GET /api/categories
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name",
      [req.user.id]
    );
    res.json(rows);
  })
);

// POST /api/categories
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { name, color, icon, type } = req.body;

    if (!name || !color || !icon || !type) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { rows } = await pool.query(
      "INSERT INTO categories (user_id, name, color, icon, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, name, color, icon, type]
    );

    res.status(201).json(rows[0]);
  })
);

// PUT /api/categories/:id
router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;
    const { name, color, icon, type } = req.body;

    const { rows } = await pool.query(
      "UPDATE categories SET name = $1, color = $2, icon = $3, type = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [name, color, icon, type, id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(rows[0]);
  })
);

// DELETE /api/categories/:id
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json({ message: "Categoria removida com sucesso" });
  })
);

export default router;
