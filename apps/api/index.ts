import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Route Handlers
import authRouter from "./routes/userauth";
import org_and_meb from "./routes/user-org_mem";
import boardsRouter from "./routes/boards";
import issuesRouter from "./routes/user_issue";
import commentsRouter from "./routes/comments";
import usersRouter from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(express.json());
app.use(cors());

/**
 * -----------------------------------------------------------------------------
 * 🩺 HEALTH CHECK
 * -----------------------------------------------------------------------------
 */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Sprintly API server is running",
        timestamp: new Date().toISOString(),
    });
});

/**
 * -----------------------------------------------------------------------------
 * 🚀 API V1 ROUTE MOUNTING
 * -----------------------------------------------------------------------------
 */

// 1. Authentication (Signup, Signin)
app.use("/api/v1/auth", authRouter);

// 2. Organizations & Members (Create, Read, Join, Update, Add/Remove Members)
app.use("/api/v1/org", org_and_meb);

// 3. Boards (Create, List by Org, Get by ID, Rename, Delete)
app.use("/api/v1/boards", boardsRouter);

// 4. Issues / Cards (Create, Move Status, Update, Delete, Card Comments)
app.use("/api/v1/issues", issuesRouter);

// 5. Standalone Comments (Edit & Delete comment)
app.use("/api/v1/comments", commentsRouter);

// 6. User Profile & Search (Current user /me, Update profile, Search users)
app.use("/api/v1/users", usersRouter);

// Server Listener
app.listen(PORT, () => {
    console.log(`Sprintly API server is running on http://localhost:${PORT}`);
});