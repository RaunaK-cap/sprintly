import express from "express";
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/userauth";
import org_and_meb from "./routes/user-org_mem";
import boardsRouter from "./routes/boards";
import issuesRouter from "./routes/user_issue";
import commentsRouter from "./routes/comments";
import usersRouter from "./routes/users";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required. Set it in the environment and restart.");
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Allowed browser origins. Set WEB_ORIGIN in production, comma separated.
// Example: WEB_ORIGIN=https://app.example.com,https://www.example.com
const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: allowedOrigins }));

// Very small in-memory limiter for the auth routes.
// Good enough for a single Render instance; swap for Redis if you scale out.
const authHits = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 30;

function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const hit = authHits.get(key);

  if (!hit || hit.resetAt < now) {
    if (authHits.size > 10000) {
      authHits.clear();
    }
    authHits.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return next();
  }

  hit.count += 1;

  if (hit.count > AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
    });
  }

  next();
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Sprintly API server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRateLimit, authRouter);
app.use("/api/v1/org", org_and_meb);
app.use("/api/v1/boards", boardsRouter);
app.use("/api/v1/issues", issuesRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/users", usersRouter);

// JSON 404 instead of Express's HTML default.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// JSON error handler. Never send stack traces to clients.
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const maybeError = error as { status?: number; statusCode?: number; message?: string };
  const status = maybeError.status || maybeError.statusCode || 500;

  if (status >= 500) {
    console.error("Unhandled API error:", error);
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : maybeError.message || "Request failed",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sprintly API server is running on port ${PORT}`);
});
