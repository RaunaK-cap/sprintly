import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  create_board,
  get_boards,
  get_board_by_id,
  update_board,
  delete_board,
} from "../controllers/board";

const boardsRouter = Router();


boardsRouter.post("/", authMiddleware, create_board);

boardsRouter.get("/", authMiddleware, get_boards);


boardsRouter.get("/:id", authMiddleware, get_board_by_id);


boardsRouter.put("/:id", authMiddleware, update_board);

boardsRouter.delete("/:id", authMiddleware, delete_board);

export default boardsRouter;
