import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/auth/me
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Auth route - get current user" });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Auth route - login" });
  })
);

// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Auth route - register" });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // Implementation will be added later
    res.json({ message: "Auth route - logout" });
  })
);

export default router;
