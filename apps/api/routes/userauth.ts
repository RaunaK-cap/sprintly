import { Router } from "express";
import { signup, signin } from "../controllers/userauth";

const authRouter = Router();

/**
 * -----------------------------------------------------------------------------
 * 🔑 AUTHENTICATION ROUTE DEFINITIONS
 * Base Path: /api/v1/auth
 * Public routes (No JWT required)
 * -----------------------------------------------------------------------------
 */

// POST /api/v1/auth/signup -> Register a new user account with firstname, lastname, email, password
authRouter.post("/signup", signup);

// POST /api/v1/auth/signin -> Authenticate with email & password, returns JWT token & user profile
authRouter.post("/signin", signin);

export default authRouter;
