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

/**
 * -----------------------------------------------------------------------------
 * 🏢 ORGANIZATION & MEMBERSHIP ROUTE DEFINITIONS
 * Base Path: /api/v1/org
 * All routes require JWT authentication via `authMiddleware`
 * -----------------------------------------------------------------------------
 */

// POST /api/v1/org/createorg -> Create an org and automatically assign the creator as ADMIN
org_and_meb.post("/createorg", authMiddleware, create_org);

// GET /api/v1/org/getorg -> Fetch user's created orgs (or specific org with ?orgId=X)
org_and_meb.get("/getorg", authMiddleware, get_org);

// GET /api/v1/org/allorgs -> List all orgs separated into `joinedOrgs` and `availableOrgs`
org_and_meb.get("/allorgs", authMiddleware, get_all_orgs);

// POST /api/v1/org/joinorg -> Join an available organization as a MEMBER
org_and_meb.post("/joinorg", authMiddleware, join_org);

// PUT /api/v1/org/updateorg -> Update organization name / description (ADMIN only)
org_and_meb.put("/updateorg", authMiddleware, update_org);

// DELETE /api/v1/org/deleteorg -> Delete an organization and its cascade relations (ADMIN only)
org_and_meb.delete("/deleteorg", authMiddleware, delete_org);

// GET /api/v1/org/members?orgId=X (or /:id/members) -> Get list of members in this org
org_and_meb.get("/members", authMiddleware, get_org_members);
org_and_meb.get("/:id/members", authMiddleware, get_org_members);

// POST /api/v1/org/addmember -> Invite / add an existing user to the org by email (ADMIN only)
org_and_meb.post("/addmember", authMiddleware, add_member_by_email);
org_and_meb.post("/:id/members", authMiddleware, add_member_by_email);

// DELETE /api/v1/org/removemember -> Remove a member from the organization (ADMIN only)
org_and_meb.delete("/removemember", authMiddleware, remove_member);
org_and_meb.delete("/:id/members/:userId", authMiddleware, remove_member);

export default org_and_meb;