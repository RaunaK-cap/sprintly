import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  create_comment,
  get_comments_by_issue,
  update_comment,
  delete_comment,
} from "../controllers/comments";

const comments = Router();

comments.post("/createcomment", authMiddleware, create_comment);
comments.get("/getcomments/:issueId", authMiddleware, get_comments_by_issue);
comments.put("/updatecomment/:commentId", authMiddleware, update_comment);
comments.delete("/deletecomment/:commentId", authMiddleware, delete_comment);

export default comments;
