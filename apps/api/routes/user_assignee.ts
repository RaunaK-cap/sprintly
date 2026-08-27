import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { add_assignee, remove_assignee } from "../controllers/assignee";

const assignees = Router();

assignees.post("/addassignee", authMiddleware, add_assignee);
assignees.delete("/removeassignee/:issueId/:userId", authMiddleware, remove_assignee);

export default assignees;
