import { Router } from "express";
import { add_member, create_org, delete_org, get_org, remove_member, remove_memberorgID, get_all_orgs, join_org } from "../controllers/organization&members";
import { authMiddleware } from "../middleware/auth";

const org_and_meb = Router()

org_and_meb.post("/createorg", authMiddleware, create_org)
org_and_meb.get("/getorg", authMiddleware, get_org)
org_and_meb.get("/allorgs", authMiddleware, get_all_orgs)
org_and_meb.post("/joinorg", authMiddleware, join_org)
org_and_meb.delete("/deleteorg", authMiddleware, delete_org)

org_and_meb.post("/addmember", authMiddleware, add_member)
org_and_meb.delete("/removemember", authMiddleware, remove_member)

org_and_meb.delete("/removememberorgID", authMiddleware, remove_memberorgID)

export default org_and_meb;