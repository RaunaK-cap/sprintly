import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  create_board,
  get_boards,
  get_board_by_id,
  update_board,
  delete_board,
} from "../controllers/board";

const boardsRouter = Router();

/**
 * -----------------------------------------------------------------------------
 * 📋 BOARDS ROUTE DEFINITIONS
 * Base Path: /api/v1/boards
 * All routes require JWT authentication via `authMiddleware`
 * -----------------------------------------------------------------------------
 */

// POST /api/v1/boards -> Create a new board inside an organization
boardsRouter.post("/", authMiddleware, create_board);

// GET /api/v1/boards?orgId=X -> Get all boards belonging to an organization
boardsRouter.get("/", authMiddleware, get_boards);

// GET /api/v1/boards/:id -> Get single board details (with columns & issues)
boardsRouter.get("/:id", authMiddleware, get_board_by_id);

// PUT /api/v1/boards/:id -> Rename or update board title
boardsRouter.put("/:id", authMiddleware, update_board);

// DELETE /api/v1/boards/:id -> Delete a board (ADMIN only)
boardsRouter.delete("/:id", authMiddleware, delete_board);

export default boardsRouter;
