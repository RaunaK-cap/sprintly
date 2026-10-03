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

issuesRouter.post("/createissue", authMiddleware, create_issue);

issuesRouter.get("/getissues", authMiddleware, get_issue);

issuesRouter.get("/getissue/:id", authMiddleware, get_issuebyid);

issuesRouter.put("/updateissue/:id", authMiddleware, update_issuebyid);

issuesRouter.put("/moveissue/:id", authMiddleware, update_issue_status);

issuesRouter.delete("/deleteissue/:id", authMiddleware, delete_issuebyid);

issuesRouter.post("/:id/comments", authMiddleware, add_comment);

issuesRouter.get("/:id/comments", authMiddleware, get_comments);

export default issuesRouter;