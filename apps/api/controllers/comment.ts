import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { prisma_client } from "database";
import { updateCommentSchema } from "../types";

/**
 * --------------------------------------------------------------------------------
 * 💬 UPDATE COMMENT
 * Endpoint: PUT /api/v1/comments/:id
 * URL Param: :id (commentId)
 * Body: { content: string }
 *
 * Description:
 *   Updates the text of an existing comment.
 *   Only the author of the comment can edit it.
 * --------------------------------------------------------------------------------
 */
export const update_comment = async (req: AuthenticatedRequest, res: Response) => {
  const commentId = Number(req.params.id);

  if (isNaN(commentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID format",
    });
  }

  const parsedInput = updateCommentSchema.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error updating comment",
      errors: parsedInput.error.issues,
    });
  }

  const { content } = parsedInput.data;
  const currentUserId = req.userId!;

  try {
    const existingComment = await prisma_client.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Security check: Only the author can edit the comment
    if (existingComment.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only edit your own comments",
      });
    }

    const updatedComment = await prisma_client.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
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
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating comment",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 💬 DELETE COMMENT
 * Endpoint: DELETE /api/v1/comments/:id
 * URL Param: :id (commentId)
 *
 * Description:
 *   Deletes a comment.
 *   Can be deleted by either the author of the comment OR an organization ADMIN.
 * --------------------------------------------------------------------------------
 */
export const delete_comment = async (req: AuthenticatedRequest, res: Response) => {
  const commentId = Number(req.params.id);

  if (isNaN(commentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID format",
    });
  }

  const currentUserId = req.userId!;

  try {
    const existingComment = await prisma_client.comment.findUnique({
      where: { id: commentId },
      include: {
        issue: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author
    const isAuthor = existingComment.userId === currentUserId;

    // Check if user is an ADMIN of the board's organization
    let isAdmin = false;
    if (existingComment.issue?.board?.organizationId) {
      const membership = await prisma_client.membership.findFirst({
        where: {
          organizationId: existingComment.issue.board.organizationId,
          userId: currentUserId,
          role: "ADMIN",
        },
      });
      if (membership) isAdmin = true;
    }

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to delete this comment",
      });
    }

    await prisma_client.comment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: { id: commentId },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting comment",
    });
  }
};
