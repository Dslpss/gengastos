import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/transactions
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Transactions route - get all transactions" });
  })
);

// POST /api/transactions
router.post(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Transactions route - create transaction" });
  })
);

// PUT /api/transactions/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Transactions route - update transaction" });
  })
);

// DELETE /api/transactions/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Transactions route - delete transaction" });
  })
);

export default router;
