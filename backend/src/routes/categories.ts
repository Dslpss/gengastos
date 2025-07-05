import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/categories
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Categories route - get all categories" });
  })
);

// POST /api/categories
router.post(
  "/",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Categories route - create category" });
  })
);

// PUT /api/categories/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Categories route - update category" });
  })
);

// DELETE /api/categories/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Categories route - delete category" });
  })
);

export default router;
