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

/**
 * --------------------------------------------------------------------------------
 * 🏢 UPDATE ORGANIZATION
 * Endpoint: PUT /api/v1/org/updateorg
 * Body: { orgId: number, name?: string, description?: string }
 *
 * Description:
 *   Updates an organization's name or description.
 *   Only an organization ADMIN can perform this action.
 * --------------------------------------------------------------------------------
 */
export const update_org = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = z.object({
        orgId: z.coerce.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
    }).safeParse(req.body);

    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error updating organization",
            errors: parsedInput.error.issues,
        });
    }

    const { orgId, name, description } = parsedInput.data;
    const currentUserId = req.userId!;

    try {
        // Security check: Must be an ADMIN to edit org info
        const adminMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: currentUserId,
                role: "ADMIN",
            },
        });

        if (!adminMembership) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only organization ADMINs can update organization details",
            });
        }

        const updateData: { name?: string; description?: string } = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;

        const updatedOrg = await prisma_client.organization.update({
            where: { id: orgId },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: updatedOrg,
        });
    } catch (error) {
        console.error("Error updating org:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error updating organization",
        });
    }
};

/**
 * --------------------------------------------------------------------------------
 * 👥 GET ORGANIZATION MEMBERS
 * Endpoint: GET /api/v1/org/members?orgId=123 (or /api/v1/org/:id/members)
 * Query / Param: orgId
 *
 * Description:
 *   Retrieves all members of an organization with their user profiles and roles.
 *   Useful for member management lists and member picker dropdowns.
 * --------------------------------------------------------------------------------
 */
export const get_org_members = async (req: AuthenticatedRequest, res: Response) => {
    const orgIdParam = req.query.orgId || req.params.orgId || req.params.id;

    if (!orgIdParam) {
        return res.status(400).json({
            success: false,
            message: "Organization ID is required",
        });
    }

    const orgId = Number(orgIdParam);
    if (isNaN(orgId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid organization ID format",
        });
    }

    const currentUserId = req.userId!;

    try {
        // Security check: Requesting user must be a member of this organization
        const userMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: currentUserId,
            },
        });

        if (!userMembership) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not a member of this organization",
            });
        }

        // Fetch all members with their basic user profiles
        const members = await prisma_client.membership.findMany({
            where: {
                organizationId: orgId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Members fetched successfully",
            data: members,
        });
    } catch (error) {
        console.error("Error fetching org members:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching members",
        });
    }
};

/**
 * --------------------------------------------------------------------------------
 * 👥 INVITE / ADD MEMBER BY EMAIL
 * Endpoint: POST /api/v1/org/addmember
 * Body: { orgId: number, email: string, role?: "ADMIN" | "MEMBER" }
 *
 * Description:
 *   Finds an existing registered user by their email address and adds them
 *   as a member to the organization. Only organization ADMINs can add members.
 * --------------------------------------------------------------------------------
 */
export const add_member_by_email = async (req: AuthenticatedRequest, res: Response) => {
    const parsedInput = z.object({
        orgId: z.coerce.number(),
        email: z.string().email("Invalid email format"),
        role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
    }).safeParse(req.body);

    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error adding member",
            errors: parsedInput.error.issues,
        });
    }

    const { orgId, email, role } = parsedInput.data;
    const currentUserId = req.userId!;

    try {
        // Security check: Requester must be an ADMIN of the organization
        const requesterMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: currentUserId,
                role: "ADMIN",
            },
        });

        if (!requesterMembership) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only organization ADMINs can invite or add members",
            });
        }

        // Look up the user to add by email
        const targetUser = await prisma_client.users.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: `No registered user found with email "${email}". Ask them to sign up first.`,
            });
        }

        // Check if user is already a member
        const existingMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: targetUser.id,
            },
        });

        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this organization",
            });
        }

        // Create the membership
        const newMembership = await prisma_client.membership.create({
            data: {
                organizationId: orgId,
                userId: targetUser.id,
                role: role,
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

        return res.status(201).json({
            success: true,
            message: `User ${targetUser.firstname} added to organization successfully`,
            data: newMembership,
        });
    } catch (error) {
        console.error("Error adding member:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error adding member",
        });
    }
};

/**
 * --------------------------------------------------------------------------------
 * 👥 REMOVE MEMBER FROM ORGANIZATION
 * Endpoint: DELETE /api/v1/org/removemember
 * Body / Query: { orgId: number, userId: number }
 *
 * Description:
 *   Removes a member from an organization.
 *   - Only an ADMIN can remove members.
 *   - An ADMIN cannot remove themselves if they are the sole ADMIN of the org.
 * --------------------------------------------------------------------------------
 */
export const remove_member = async (req: AuthenticatedRequest, res: Response) => {
    const orgId = Number(req.body.orgId || req.query.orgId);
    const targetUserId = Number(req.body.userId || req.query.userId);

    if (isNaN(orgId) || isNaN(targetUserId)) {
        return res.status(400).json({
            success: false,
            message: "Valid 'orgId' and 'userId' are required",
        });
    }

    const currentUserId = req.userId!;

    try {
        // Security check: Requester must be an ADMIN
        const requesterMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: currentUserId,
                role: "ADMIN",
            },
        });

        if (!requesterMembership) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only organization ADMINs can remove members",
            });
        }

        // If trying to remove an ADMIN, ensure there is at least one other ADMIN left
        const targetMembership = await prisma_client.membership.findFirst({
            where: {
                organizationId: orgId,
                userId: targetUserId,
            },
        });

        if (!targetMembership) {
            return res.status(404).json({
                success: false,
                message: "Member not found in this organization",
            });
        }

        if (targetMembership.role === "ADMIN") {
            const adminCount = await prisma_client.membership.count({
                where: {
                    organizationId: orgId,
                    role: "ADMIN",
                },
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot remove the only ADMIN of the organization. Transfer ownership or promote another member first.",
                });
            }
        }

        // Remove the membership
        await prisma_client.membership.delete({
            where: {
                id: targetMembership.id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Member removed from organization successfully",
            data: { orgId, userId: targetUserId },
        });
    } catch (error) {
        console.error("Error removing member:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error removing member",
        });
    }
};

