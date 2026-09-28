import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  create_issue,
  delete_issuebyid,
  get_issue,
  get_issuebyid,
  update_issuebyid,
  update_issue_status,
  add_comment,
  get_comments,
} from "../controllers/issue";

const issuesRouter = Router();

/**
 * -----------------------------------------------------------------------------
 * 🏷️ ISSUE (CARD) ROUTE DEFINITIONS
 * Base Path: /api/v1/issues
 * All routes require JWT authentication via `authMiddleware`
 * -----------------------------------------------------------------------------
 */

// POST /api/v1/issues/createissue -> Create a new card in a board (default status: TODO)
issuesRouter.post("/createissue", authMiddleware, create_issue);

// GET /api/v1/issues/getissues?boardId=X -> Fetch all cards for a specific board
issuesRouter.get("/getissues", authMiddleware, get_issue);

// GET /api/v1/issues/getissue/:id -> Fetch single card details (with creator & board info)
issuesRouter.get("/getissue/:id", authMiddleware, get_issuebyid);

// PUT /api/v1/issues/updateissue/:id -> Update card title or description
issuesRouter.put("/updateissue/:id", authMiddleware, update_issuebyid);

// PUT /api/v1/issues/moveissue/:id -> Move card across columns (TODO <-> IN_PROGRESS <-> DONE)
issuesRouter.put("/moveissue/:id", authMiddleware, update_issue_status);

// DELETE /api/v1/issues/deleteissue/:id -> Delete a card and its comments
issuesRouter.delete("/deleteissue/:id", authMiddleware, delete_issuebyid);

// POST /api/v1/issues/:id/comments -> Add a new comment to a card
issuesRouter.post("/:id/comments", authMiddleware, add_comment);

// GET /api/v1/issues/:id/comments -> Get all comments for a card in chronological order
issuesRouter.get("/:id/comments", authMiddleware, get_comments);

export default issuesRouter;