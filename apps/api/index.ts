import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/userauth";
import org_and_meb from "./routes/user-org_mem ";
import boards from "./routes/user_board";
import issues from "./routes/user_issue";
import assignees from "./routes/user_assignee";
import comments from "./routes/user_comments";
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.get("/health", (req, res) => {
    res.json({
        message: "API server is running",
    });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/org", org_and_meb);
app.use("/api/v1/boards", boards);
app.use("/api/v1/issues", issues);
app.use("/api/v1/assignees", assignees);
app.use("/api/v1/comments", comments);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});