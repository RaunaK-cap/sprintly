import { Router } from "express";
import { create_org, delete_org, get_org, get_all_orgs, join_org } from "../controllers/organization&members";
import { authMiddleware } from "../middleware/auth";

const org_and_meb = Router()

org_and_meb.post("/createorg", authMiddleware, create_org)
org_and_meb.get("/getorg", authMiddleware, get_org)
org_and_meb.get("/allorgs", authMiddleware, get_all_orgs)
org_and_meb.post("/joinorg", authMiddleware, join_org)
org_and_meb.delete("/deleteorg", authMiddleware, delete_org)

export default org_and_meb;