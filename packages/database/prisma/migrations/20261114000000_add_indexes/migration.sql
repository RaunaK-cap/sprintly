-- Indexes for the foreign keys used by the most common queries.

CREATE INDEX "board_organizationId_idx" ON "board"("organizationId");

CREATE INDEX "issue_boardId_idx" ON "issue"("boardId");
CREATE INDEX "issue_boardId_status_idx" ON "issue"("boardId", "status");

CREATE INDEX "comment_issueId_idx" ON "comment"("issueId");

CREATE INDEX "membership_organizationId_role_idx" ON "membership"("organizationId", "role");
