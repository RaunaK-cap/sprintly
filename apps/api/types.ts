import { z } from "zod";


// 🔑 Auth Schemas

export const signupSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});


// 🏢 Organization & Member Schemas

export const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
});

export const getOrgSchema = z.object({
  orgId: z.coerce.number().optional(),
});

export const updateOrgSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  name: z.string().min(1, "Organization name is required").optional(),
  description: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  email: z.string().email("Invalid email address"),
});

export const addMemberSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  userId: z.coerce.number({ message: "User ID is required" }),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export const deleteOrgSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
});

// 📋 Board Schemas

export const createBoardSchema = z.object({
  title: z.string().min(1, "Board title is required"),
  organizationId: z.number({ message: "Organization ID is required" }),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1, "Board title is required"),
});


// 🏷️ Issue (Card) Schemas

export const issueStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createIssueSchema = z.object({
  title: z.string().min(1, "Issue title is required"),
  description: z.string().optional(),
  boardId: z.number({ message: "Board ID is required" }),
  status: issueStatusEnum.optional().default("TODO"),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const moveIssueStatusSchema = z.object({
  status: issueStatusEnum,
});

// 👥 Issue Assignee Schemas

export const addAssigneeSchema = z.object({
  issueId: z.number({ message: "Issue ID is required" }),
  userId: z.number({ message: "User ID is required" }),
});

// 💬 Comment Schemas

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  issueId: z.number({ message: "Issue ID is required" }),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
});

// 🏷️ Inferred TypeScript Types

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

export type IssueStatus = z.infer<typeof issueStatusEnum>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type MoveIssueStatusInput = z.infer<typeof moveIssueStatusSchema>;

export type AddAssigneeInput = z.infer<typeof addAssigneeSchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
