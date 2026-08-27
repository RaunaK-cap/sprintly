import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  create_issue,
  delete_issuebyid,
  get_issue,
  get_issuebyid,
  update_issuebyid,
  update_issue_status,
} from "../controllers/issue";

const issues = Router();

issues.post("/createissue", authMiddleware, create_issue);
issues.put("/updateissue/:id", authMiddleware, update_issuebyid);
issues.put("/moveissue/:id", authMiddleware, update_issue_status);
issues.get("/getissues", authMiddleware, get_issue);
issues.get("/getissue/:id", authMiddleware, get_issuebyid);
issues.delete("/deleteissue/:id", authMiddleware, delete_issuebyid);

export default issues;