import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { createOrgSchema, getOrgSchema, deleteOrgSchema, addMemberSchema } from "../types";
import { prisma_client } from "database";
import { z } from "zod";

export const create_org = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = createOrgSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error creating organization",
        });
    }

    const { name, description } = parsedInput.data;

    try {
        const org = await prisma_client.organization.create({
            data: {
                name: name,
                description: description,
                memberships: {
                    create: {
                        userId: req.userId!,
                        role: "ADMIN", // Explicitly make the creator the ADMIN
                    }
                }
            }
        });

        // Auto-create a default board with the exact same ID as the Org ID
        await prisma_client.board.create({
            data: {
                id: org.id,
                title: `${name} Board`,
                organizationId: org.id,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Organization created successfully",
            data: org,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error creating organization",
        });
    }
};

export const get_org = async (req: AuthenticatedRequest, res: Response) => {
    // Parse query first, fall back to params
    const parseddata = getOrgSchema.safeParse({
        orgId: req.query.orgId || req.params.orgId || req.params.id
    });

    if (!parseddata.success) {
        return res.status(400).json({
            success: false,
            errors: parseddata.error.issues,
            message: "Validation error getting organization",
        });
    }

    const { orgId } = parseddata.data;

    try {
        if (orgId) {
            // Get specific organization where the user is a member, including its boards
            const org = await prisma_client.organization.findFirst({
                where: {
                    id: orgId,
                    memberships: {
                        some: {
                            userId: req.userId!
                        }
                    }
                },
                include: {
                    board: true, // Includes all boards belonging to this org (Trello Board Navigation)
                }
            });

            if (!org) {
                return res.status(404).json({
                    success: false,
                    message: "Organization not found or you are not a member",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Organization fetched successfully",
                data: org,
            });
        } else {
            // Get all organizations the user is a member of
            const orgs = await prisma_client.organization.findMany({
                where: {
                    memberships: {
                        some: {
                            userId: req.userId!
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                message: "Organizations fetched successfully",
                data: orgs,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching organization",
        });
    }
};

export const delete_org = async (req: AuthenticatedRequest, res: Response) => {
    const parseddata = deleteOrgSchema.safeParse({
        orgId: req.body.orgId || req.query.orgId || req.params.orgId
    });

    if (!parseddata.success) {
        return res.status(400).json({
            success: false,
            errors: parseddata.error.issues,
            message: "Validation error deleting organization",
        });
    }

    const { orgId } = parseddata.data;

    try {
        // 1. Check if the user is an ADMIN of the org
        const membership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: req.userId!,
                role: "ADMIN",
            }
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only administrators can delete this organization",
            });
        }

        // 2. Delete organization
        await prisma_client.organization.delete({
            where: {
                id: orgId,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Organization deleted successfully",
            data: orgId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error deleting organization",
        });
    }
};

export const add_member = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = addMemberSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error adding member",
        });
    }

    const { orgId, userId, role } = parsedInput.data;

    try {
        // Check if caller is ADMIN of the org
        const isCallerAdmin = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: req.userId!,
                role: "ADMIN",
            }
        });

        if (!isCallerAdmin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only administrators can add members",
            });
        }

        // Add user to organization membership
        const newMembership = await prisma_client.membership.create({
            data: {
                organizationId: orgId,
                userId: userId,
                role: role,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: newMembership,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error adding member",
        });
    }
};

export const remove_member = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = z.object({
        orgId: z.coerce.number(),
        userId: z.coerce.number(),
    }).safeParse(req.body);

    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error removing member",
        });
    }

    const { orgId, userId } = parsedInput.data;

    try {
        // Must be ADMIN, or leaving oneself
        const isCallerAdmin = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: req.userId!,
                role: "ADMIN",
            }
        });

        if (!isCallerAdmin && userId !== req.userId!) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only administrators can remove members, or you can leave the organization",
            });
        }

        await prisma_client.membership.delete({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: orgId,
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Member removed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error removing member",
        });
    }
};

export const remove_memberorgID = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = z.object({
        orgId: z.coerce.number(),
    }).safeParse(req.body);

    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error leaving organization",
        });
    }

    const { orgId } = parsedInput.data;

    try {
        await prisma_client.membership.delete({
            where: {
                userId_organizationId: {
                    userId: req.userId!,
                    organizationId: orgId,
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Left organization successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error leaving organization",
        });
    }
};

export const get_all_orgs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Get all organizations
        const allOrgs = await prisma_client.organization.findMany({
            include: {
                memberships: true
            }
        });

        // Classify them into "myOrgs" (already joined) and "otherOrgs" (available to join)
        const myOrgs = [];
        const otherOrgs = [];

        for (const org of allOrgs) {
            const isMember = org.memberships.some(m => m.userId === req.userId);
            const orgData = {
                id: org.id,
                name: org.name,
                description: org.description,
                createdAt: org.createdAt,
            };
            if (isMember) {
                myOrgs.push(orgData);
            } else {
                otherOrgs.push(orgData);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                myOrgs,
                otherOrgs
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching all organizations"
        });
    }
};

export const join_org = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = z.object({
        orgId: z.coerce.number()
    }).safeParse(req.body);

    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            message: "Organization ID is required"
        });
    }

    const { orgId } = parsedInput.data;

    try {
        const existing = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: req.userId!
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this organization"
            });
        }

        const membership = await prisma_client.membership.create({
            data: {
                organizationId: orgId,
                userId: req.userId!,
                role: "MEMBER" // Creator is ADMIN, joiner is MEMBER
            }
        });

        return res.status(200).json({
            success: true,
            message: "Joined organization successfully",
            data: membership
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error joining organization"
        });
    }
};
