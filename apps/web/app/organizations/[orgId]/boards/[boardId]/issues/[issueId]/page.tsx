import { redirect } from "next/navigation";

// Old nested route. The board view lives at /checkingboard/[boardId] now.
export default async function OrganizationsIssueRedirect({
  params,
}: {
  params: Promise<{ orgId: string; boardId: string; issueId: string }>;
}) {
  const { boardId, issueId } = await params;
  redirect(`/checkingboard/${boardId}/issues/${issueId}`);
}
