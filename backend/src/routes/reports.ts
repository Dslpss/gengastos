import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/reports/dashboard
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get dashboard data" });
  })
);

// GET /api/reports/monthly
router.get(
  "/monthly",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get monthly report" });
  })
);

// GET /api/reports/categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - get categories report" });
  })
);

// GET /api/reports/export
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Reports route - export data" });
  })
);

export default router;
