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
            // Get all organizations the user CREATED (ADMIN)
            const orgs = await prisma_client.organization.findMany({
                where: {
                    memberships: {
                        some: {
                            userId: req.userId!,
                            role: "ADMIN"
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
        orgId: req.query.orgId
    });

    

    if (!parseddata.success) {
        return res.status(400).json({
            success: false,
            errors: parseddata.error.issues,
            message: "Validation error deleting organization",
        });
    }

    const orgId = parseddata.data.orgId;

    try {
        // Check if the user is a member of the org
        const membership = await prisma_client.membership.findFirst({
            where: {
                organizationId: Number(orgId),
                userId: req.userId!,
            }
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You are not a member of this organization",
            });
        }

        // Delete all memberships first (no cascade on this relation)
        await prisma_client.membership.deleteMany({
            where: { organizationId: orgId }
        });

        // Delete organization (boards cascade automatically)
        await prisma_client.organization.delete({
            where: {
                id: Number(orgId),
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

export const get_all_orgs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        
        
        // Get ALL organizations in the system
        const allOrgs = await prisma_client.organization.findMany({
            include: {
                memberships: true
            }
        });

        

        // Filter out orgs where this user is ADMIN (creator)
        // and separate the rest into joined vs available
        const joinedOrgs = [];
        const availableOrgs = [];

        for (const org of allOrgs) {
            const isCreator = org.memberships.some(m => m.userId === req.userId && m.role === "ADMIN");
            
            // Skip orgs the user created - those go to left side via /getorg
            if (isCreator) {
                
                continue;
            }
            
            const isMember = org.memberships.some(m => m.userId === req.userId);
            const orgData = {
                id: org.id,
                name: org.name,
                description: org.description,
                createdAt: org.createdAt,
            };
            
            if (isMember) {
                joinedOrgs.push(orgData);
            } else {
                availableOrgs.push(orgData);
            }
        }

       

        return res.status(200).json({
            success: true,
            data: {
                joinedOrgs,
                availableOrgs
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
