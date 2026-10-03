import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { update_comment, delete_comment } from "../controllers/comment";

const commentsRouter = Router();


commentsRouter.put("/:id", authMiddleware, update_comment);

commentsRouter.delete("/:id", authMiddleware, delete_comment);

export default commentsRouter;
