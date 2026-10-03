import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/userauth";
import org_and_meb from "./routes/user-org_mem";
import boardsRouter from "./routes/boards";
import issuesRouter from "./routes/user_issue";
import commentsRouter from "./routes/comments";
import usersRouter from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Sprintly API server is running",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/org", org_and_meb);

app.use("/api/v1/boards", boardsRouter);

app.use("/api/v1/issues", issuesRouter);

app.use("/api/v1/comments", commentsRouter);

app.use("/api/v1/users", usersRouter);

app.listen(PORT, () => {
    console.log(`Sprintly API server is running on http://localhost:${PORT}`);
});