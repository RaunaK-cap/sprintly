import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { create_boards, deleteboardbyid, get_allboards, get_boardbyid, updateboardbyid } from "../controllers/boards";


const boards = Router()

boards.post("/createboard", authMiddleware, create_boards)
boards.get("/getboards", authMiddleware, get_allboards)
boards.get("/getboard/:id", authMiddleware, get_boardbyid)
boards.delete("/deleteboard/:id", authMiddleware, deleteboardbyid)
boards.put("/updateboard/:id", authMiddleware, updateboardbyid)


export default boards