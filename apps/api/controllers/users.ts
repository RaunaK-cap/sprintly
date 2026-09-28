import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { prisma_client } from "database";
import { z } from "zod";

/**
 * --------------------------------------------------------------------------------
 * 👤 GET CURRENT USER PROFILE
 * Endpoint: GET /api/v1/users/me
 *
 * Description:
 *   Retrieves the currently authenticated user's profile information along
 *   with aggregate counts (organizations joined, total created issues).
 * --------------------------------------------------------------------------------
 */
export const get_current_user = async (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.userId!;

  try {
    const user = await prisma_client.users.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            membership: true,
            issues: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching user profile",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 👤 UPDATE CURRENT USER PROFILE
 * Endpoint: PUT /api/v1/users/me
 * Body: { firstname?: string, lastname?: string }
 *
 * Description:
 *   Updates the authenticated user's first name or last name.
 * --------------------------------------------------------------------------------
 */
export const update_current_user = async (req: AuthenticatedRequest, res: Response) => {
  const parsedInput = z.object({
    firstname: z.string().min(1, "First name cannot be empty").optional(),
    lastname: z.string().min(1, "Last name cannot be empty").optional(),
  }).safeParse(req.body);

  if (!parsedInput.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error updating profile",
      errors: parsedInput.error.issues,
    });
  }

  const { firstname, lastname } = parsedInput.data;
  const currentUserId = req.userId!;

  try {
    const updatedData: { firstname?: string; lastname?: string } = {};
    if (firstname) updatedData.firstname = firstname.trim();
    if (lastname) updatedData.lastname = lastname.trim();

    const updatedUser = await prisma_client.users.update({
      where: { id: currentUserId },
      data: updatedData,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating user profile",
    });
  }
};

/**
 * --------------------------------------------------------------------------------
 * 🔍 SEARCH USERS
 * Endpoint: GET /api/v1/users/search?q=john
 * Query: ?q=string
 *
 * Description:
 *   Searches for users by matching partial name or email.
 *   Useful for autocomplete in "Invite Member" forms.
 * --------------------------------------------------------------------------------
 */
export const search_users = async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string;

  if (!query || query.trim().length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  const searchTerm = query.trim();

  try {
    const users = await prisma_client.users.findMany({
      where: {
        OR: [
          { firstname: { contains: searchTerm, mode: "insensitive" } },
          { lastname: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
      take: 10, // Limit to top 10 search results
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error searching users",
    });
  }
};
