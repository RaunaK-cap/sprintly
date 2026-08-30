import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { prisma_client } from "database";
import { createIssueSchema, updateIssueSchema, moveIssueStatusSchema } from "../types";
import { z } from "zod";

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
        return res.status(500).json({
            success: false,
            message: "Internal server error creating issue",
        });
    }
};

export const get_issue = async (req: AuthenticatedRequest, res: Response) => {
    const boardIdQuery = req.query.boardId;
    if (!boardIdQuery) {
        return res.status(400).json({
            success: false,
            message: "Board ID query parameter is required",
        });
    }

    try {
        const issues = await prisma_client.issue.findMany({
            where: {
                boardId: Number(boardIdQuery),
            }
        });

        return res.status(200).json({
            success: true,
            data: issues,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching issues",
        });
    }
};

export const get_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    try {
        const issue = await prisma_client.issue.findUnique({
            where: {
                id: issueId,
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
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching issue",
        });
    }
};

export const update_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
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
        return res.status(500).json({
            success: false,
            message: "Internal server error updating issue",
        });
    }
};

export const update_issue_status = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
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
        return res.status(500).json({
            success: false,
            message: "Internal server error moving issue",
        });
    }
};

export const delete_issuebyid = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid issue ID format",
        });
    }

    try {
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
        return res.status(500).json({
            success: false,
            message: "Internal server error deleting issue",
        });
    }
};