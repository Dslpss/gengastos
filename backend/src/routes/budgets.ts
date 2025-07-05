import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/budgets
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Budgets route - get all budgets" });
  })
);

// POST /api/budgets
router.post(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Budgets route - create budget" });
  })
);

// PUT /api/budgets/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Budgets route - update budget" });
  })
);

// DELETE /api/budgets/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Budgets route - delete budget" });
  })
);

export default router;
