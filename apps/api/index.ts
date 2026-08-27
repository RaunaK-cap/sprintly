import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/userauth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        message: "API server is running",
    });
});

app.use("/api/v1/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});