import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { prisma_client } from "database";
import { createBoardSchema, updateBoardSchema } from "../types";
import { z } from "zod";

/**
 * --------------------------------------------------------------------------------
 * 📋 CREATE BOARD
 * Endpoint: POST /api/v1/boards
 * Body: { title: string, organizationId: number }
 *
 * Description:
 *   Creates a new Kanban board inside a specific organization.
 *   Ensures that only members of the organization can create boards within it.
 * --------------------------------------------------------------------------------
 */
export const create_board = async (req: AuthenticatedRequest, res: Response) => {
  // Validate request body schema
  const parsedInput = createBoardSchema.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error creating board",
      errors: parsedInput.error.issues,
    });
  }

  const { title, organizationId } = parsedInput.data;
  const currentUserId = req.userId!;

  try {
    // Security check: Verify that the requesting user is a member of this organization
    const membership = await prisma_client.membership.findFirst({
      where: {
        organizationId: Number(organizationId),
        userId: currentUserId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this organization",
      });
    }

    // Create the new board in the database
    const newBoard = await prisma_client.board.create({
      data: {
        title: title.trim(),
        organizationId: Number(organizationId),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      data: newBoard,
    });
  } catch (error) {
    console.error("Error creating board:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error creating board",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 📋 GET BOARDS FOR AN ORGANIZATION
 * Endpoint: GET /api/v1/boards?orgId=123
 * Query Params: ?orgId=number
 *
 * Description:
 *   Retrieves all boards belonging to a specific organization.
 *   Includes a count of total issues per board to display on dashboard cards.
 * --------------------------------------------------------------------------------
 */
export const get_boards = async (req: AuthenticatedRequest, res: Response) => {
  const orgIdParam = req.query.orgId || req.params.orgId;

  if (!orgIdParam) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'orgId' is required",
    });
  }

  const organizationId = Number(orgIdParam);
  if (isNaN(organizationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization ID format",
    });
  }

  const currentUserId = req.userId!;

  try {
    // Security check: Verify user belongs to this org
    const membership = await prisma_client.membership.findFirst({
      where: {
        organizationId: organizationId,
        userId: currentUserId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this organization's boards",
      });
    }

    // Fetch all boards for this organization with issue counts
    const boards = await prisma_client.board.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        _count: {
          select: {
            issues: true, // Returns { issues: number } count for each board
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Boards fetched successfully",
      data: boards,
    });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching boards",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 📋 GET SINGLE BOARD BY ID
 * Endpoint: GET /api/v1/boards/:id
 * URL Param: :id (boardId)
 *
 * Description:
 *   Retrieves full details of a specific board, including its organization,
 *   and all its cards/issues categorized into TODO, IN_PROGRESS, DONE.
 * --------------------------------------------------------------------------------
 */
export const get_board_by_id = async (req: AuthenticatedRequest, res: Response) => {
  const boardId = Number(req.params.id);

  if (isNaN(boardId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid board ID format",
    });
  }

  const currentUserId = req.userId!;

  try {
    // Fetch board with parent org
    const board = await prisma_client.board.findUnique({
      where: { id: boardId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        issues: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Security check: Check if user is member of board's organization
    const membership = await prisma_client.membership.findFirst({
      where: {
        organizationId: board.organizationId,
        userId: currentUserId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this board's organization",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Board fetched successfully",
      data: board,
    });
  } catch (error) {
    console.error("Error fetching board by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching board",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 📋 UPDATE / RENAME BOARD
 * Endpoint: PUT /api/v1/boards/:id
 * URL Param: :id (boardId)
 * Body: { title: string }
 *
 * Description:
 *   Updates the title of a board.
 *   Any member of the organization can update the board name.
 * --------------------------------------------------------------------------------
 */
export const update_board = async (req: AuthenticatedRequest, res: Response) => {
  const boardId = Number(req.params.id);

  if (isNaN(boardId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid board ID format",
    });
  }

  const parsedInput = updateBoardSchema.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error updating board",
      errors: parsedInput.error.issues,
    });
  }

  const { title } = parsedInput.data;
  const currentUserId = req.userId!;

  try {
    // Find the board to get its organizationId
    const existingBoard = await prisma_client.board.findUnique({
      where: { id: boardId },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Security check: Ensure user is a member of the organization
    const membership = await prisma_client.membership.findFirst({
      where: {
        organizationId: existingBoard.organizationId,
        userId: currentUserId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this board's organization",
      });
    }

    // Update board title
    const updatedBoard = await prisma_client.board.update({
      where: { id: boardId },
      data: {
        title: title.trim(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Board updated successfully",
      data: updatedBoard,
    });
  } catch (error) {
    console.error("Error updating board:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating board",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 📋 DELETE BOARD
 * Endpoint: DELETE /api/v1/boards/:id
 * URL Param: :id (boardId)
 *
 * Description:
 *   Deletes a board and all its child issues/comments (cascade).
 *   Only an organization ADMIN can delete a board.
 * --------------------------------------------------------------------------------
 */
export const delete_board = async (req: AuthenticatedRequest, res: Response) => {
  const boardId = Number(req.params.id);

  if (isNaN(boardId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid board ID format",
    });
  }

  const currentUserId = req.userId!;

  try {
    // Find existing board
    const existingBoard = await prisma_client.board.findUnique({
      where: { id: boardId },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Security check: Only an ADMIN of the organization can delete boards
    const membership = await prisma_client.membership.findFirst({
      where: {
        organizationId: existingBoard.organizationId,
        userId: currentUserId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only organization ADMINs can delete boards",
      });
    }

    // Delete the board (cascade will handle child issues & comments)
    await prisma_client.board.delete({
      where: { id: boardId },
    });

    return res.status(200).json({
      success: true,
      message: "Board deleted successfully",
      data: { id: boardId },
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting board",
    });
  }
};
