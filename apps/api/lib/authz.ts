import { prisma_client } from "database";

// Returns true only when the user is a member of the board's organization.
export async function canAccessBoard(userId: number, boardId: number) {
    if (!Number.isInteger(boardId) || boardId <= 0) {
        return false;
    }

    const board = await prisma_client.board.findUnique({
        where: { id: boardId },
        select: { organizationId: true },
    });

    if (!board) {
        return false;
    }

    const membership = await prisma_client.membership.findFirst({
        where: {
            organizationId: board.organizationId,
            userId,
        },
        select: { id: true },
    });

    return Boolean(membership);
}

// Returns the board id for an issue, or null when the issue does not exist.
export async function getIssueBoardId(issueId: number) {
    if (!Number.isInteger(issueId) || issueId <= 0) {
        return null;
    }

    const issue = await prisma_client.issue.findUnique({
        where: { id: issueId },
        select: { boardId: true },
    });

    return issue ? issue.boardId : null;
}

// Returns true only when the user is a member of the issue's organization.
export async function canAccessIssue(userId: number, issueId: number) {
    const boardId = await getIssueBoardId(issueId);
    if (boardId === null) {
        return false;
    }

    return canAccessBoard(userId, boardId);
}
