import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  get_current_user,
  update_current_user,
  search_users,
} from "../controllers/users";

const usersRouter = Router();

/**
 * -----------------------------------------------------------------------------
 * 👤 USER PROFILE & SEARCH ROUTE DEFINITIONS
 * Base Path: /api/v1/users
 * All routes require JWT authentication via `authMiddleware`
 * -----------------------------------------------------------------------------
 */

// GET /api/v1/users/me -> Get current logged-in user profile with stats
usersRouter.get("/me", authMiddleware, get_current_user);

// PUT /api/v1/users/me -> Update current logged-in user profile (firstname, lastname)
usersRouter.put("/me", authMiddleware, update_current_user);

// GET /api/v1/users/search?q=john -> Search users by name or email for invites
usersRouter.get("/search", authMiddleware, search_users);

export default usersRouter;
