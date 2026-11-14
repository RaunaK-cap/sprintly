import { z } from "zod";

// Common string rules. Trim first so "   " is rejected.
const name = z.string().trim().min(1, "This field is required").max(50, "Too long");
const title = z.string().trim().min(1, "Title is required").max(200, "Title is too long");
const description = z.string().trim().max(5000, "Description is too long");

export const signupSchema = z.object({
  firstname: name,
  lastname: name,
  email: z.string().trim().email("Invalid email address").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password is too long"),
});

export const signinSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createOrgSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(100),
  description: description.optional(),
});

export const getOrgSchema = z.object({
  orgId: z.coerce.number().optional(),
});

export const updateOrgSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  name: z.string().trim().min(1, "Organization name is required").max(100).optional(),
  description: description.optional(),
});

export const inviteMemberSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  email: z.string().trim().email("Invalid email address"),
});

export const addMemberSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
  userId: z.coerce.number({ message: "User ID is required" }),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export const deleteOrgSchema = z.object({
  orgId: z.coerce.number({ message: "Organization ID is required" }),
});

export const createBoardSchema = z.object({
  title: title,
  organizationId: z.number({ message: "Organization ID is required" }),
});

export const updateBoardSchema = z.object({
  title: title,
});

export const issueStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createIssueSchema = z.object({
  title: title,
  description: description.optional(),
  boardId: z.number({ message: "Board ID is required" }),
  status: issueStatusEnum.optional().default("TODO"),
});

export const updateIssueSchema = z.object({
  title: title.optional(),
  description: description.optional(),
});

export const moveIssueStatusSchema = z.object({
  status: issueStatusEnum,
});

export const addAssigneeSchema = z.object({
  issueId: z.number({ message: "Issue ID is required" }),
  userId: z.number({ message: "User ID is required" }),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(5000),
  issueId: z.number({ message: "Issue ID is required" }),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(5000),
});

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
