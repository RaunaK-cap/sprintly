import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { update_comment, delete_comment } from "../controllers/comment";

const commentsRouter = Router();

/**
 * -----------------------------------------------------------------------------
 * 💬 COMMENTS ROUTE DEFINITIONS
 * Base Path: /api/v1/comments
 * All routes require JWT authentication via `authMiddleware`
 * -----------------------------------------------------------------------------
 */

// PUT /api/v1/comments/:id -> Update comment content (author only)
commentsRouter.put("/:id", authMiddleware, update_comment);

// DELETE /api/v1/comments/:id -> Delete comment (author or org admin)
commentsRouter.delete("/:id", authMiddleware, delete_comment);

export default commentsRouter;
