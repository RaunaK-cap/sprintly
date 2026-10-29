import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  get_current_user,
  update_current_user,
  search_users,
} from "../controllers/users";

const usersRouter = Router();

// USER PROFILE & SEARCH ROUTE DEFINITIONS

usersRouter.get("/me", authMiddleware, get_current_user);

usersRouter.put("/me", authMiddleware, update_current_user);

usersRouter.get("/search", authMiddleware, search_users);

export default usersRouter;
