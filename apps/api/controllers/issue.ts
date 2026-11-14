import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { prisma_client } from "database";
import { createIssueSchema, updateIssueSchema, moveIssueStatusSchema } from "../types";
import { canAccessBoard, canAccessIssue } from "../lib/authz";
import { isPositiveInt, sendError } from "../lib/errors";

export const create_issue = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = createIssueSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error creating issue",
        });
    }

    const { title, description, boardId, status } = parsedInput.data;

    try {
        // The user must belong to the organization that owns the board.
        const allowed = await canAccessBoard(req.userId!, boardId);
        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this board",
            });
        }

        const issue = await prisma_client.issue.create({
            data: {
                title,
                description,
                boardId,
                userId: req.userId!,
                status,
            }
        });

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: issue,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error creating issue");
    }
};

export const get_issue = async (req: AuthenticatedRequest, res: Response) => {
    const boardId = Number(req.query.boardId);

    if (!isPositiveInt(boardId)) {
        return res.status(400).json({
            success: false,
            message: "Board ID query parameter is required",
        });
    }

    try {
        const allowed = await canAccessBoard(req.userId!, boardId);
        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this board",
            });
        }

        const issues = await prisma_client.issue.findMany({
            where: {
                boardId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            data: issues,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error fetching issues");
    }
};

export const get_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (!isPositiveInt(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const issue = await prisma_client.issue.findUnique({
            where: {
                id: issueId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                    }
                },
                board: {
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
                        organization: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error fetching issue");
    }
};

export const update_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (!isPositiveInt(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    const parsedInput = updateIssueSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error updating issue",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const updatedIssue = await prisma_client.issue.update({
            where: {
                id: issueId,
            },
            data: parsedInput.data,
        });

        return res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: updatedIssue,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error updating issue");
    }
};

export const update_issue_status = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (!isPositiveInt(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    const parsedInput = moveIssueStatusSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error moving issue",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const updatedIssue = await prisma_client.issue.update({
            where: {
                id: issueId,
            },
            data: {
                status: parsedInput.data.status,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Issue status moved successfully",
            data: updatedIssue,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error moving issue");
    }
};

export const delete_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (!isPositiveInt(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        await prisma_client.issue.delete({
            where: {
                id: issueId,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    } catch (error) {
        return sendError(res, error, "Internal server error deleting issue");
    }
};

export const add_comment = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!isPositiveInt(issueId) || !content) {
        return res.status(400).json({
            success: false,
            message: "Issue ID and non-empty content are required",
        });
    }

    if (content.length > 5000) {
        return res.status(400).json({
            success: false,
            message: "Comment is too long",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const comment = await prisma_client.comment.create({
            data: {
                content,
                issueId,
                userId: req.userId!,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: comment,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error adding comment");
    }
};

export const get_comments = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);

    if (!isPositiveInt(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    try {
        const allowed = await canAccessIssue(req.userId!, issueId);
        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const comments = await prisma_client.comment.findMany({
            where: {
                issueId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        return sendError(res, error, "Internal server error fetching comments");
    }
};
