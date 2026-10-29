import { Router } from "express";
import {
  create_org,
  get_org,
  get_all_orgs,
  join_org,
  delete_org,
  update_org,
  get_org_members,
  add_member_by_email,
  remove_member,
} from "../controllers/organization&members";
import { authMiddleware } from "../middleware/auth";

const org_and_meb = Router();


org_and_meb.post("/createorg", authMiddleware, create_org);

org_and_meb.get("/getorg", authMiddleware, get_org);

org_and_meb.get("/allorgs", authMiddleware, get_all_orgs);

org_and_meb.post("/joinorg", authMiddleware, join_org);

org_and_meb.put("/updateorg", authMiddleware, update_org);

org_and_meb.delete("/deleteorg", authMiddleware, delete_org);

org_and_meb.get("/members", authMiddleware, get_org_members);
org_and_meb.get("/:id/members", authMiddleware, get_org_members);

org_and_meb.post("/addmember", authMiddleware, add_member_by_email);
org_and_meb.post("/:id/members", authMiddleware, add_member_by_email);

org_and_meb.delete("/removemember", authMiddleware, remove_member);
org_and_meb.delete("/:id/members/:userId", authMiddleware, remove_member);

export default org_and_meb;