import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { prisma_client } from "database";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 10000);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is required. Set it in the environment and restart.");
    process.exit(1);
}

type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE";

type ClientInfo = {
    userId: number;
    userName: string;
    boardId: number | null;
    orgId: number | null;
    isAlive: boolean;
};

// One room per board. Each room holds the sockets currently viewing it.
const rooms = new Map<number, Set<WebSocket>>();
const clients = new WeakMap<WebSocket, ClientInfo>();

function send(socket: WebSocket, payload: Record<string, unknown>) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
}

function broadcast(boardId: number, payload: Record<string, unknown>) {
    const room = rooms.get(boardId);
    if (!room) return;

    for (const socket of room) {
        send(socket, payload);
    }
}

function asPositiveInt(value: unknown) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

function asString(value: unknown) {
    return typeof value === "string" ? value : "";
}

function parseStatus(value: unknown): IssueStatus | null {
    if (value === "TODO" || value === "IN_PROGRESS" || value === "DONE") {
        return value;
    }
    return null;
}

// The user must be a member of the organization that owns the board.
async function getBoardForUser(userId: number, boardId: number) {
    const board = await prisma_client.board.findUnique({
        where: { id: boardId },
        select: { id: true, organizationId: true },
    });

    if (!board) return null;

    const membership = await prisma_client.membership.findFirst({
        where: {
            organizationId: board.organizationId,
            userId,
        },
        select: { id: true },
    });

    return membership ? board : null;
}

async function issueBelongsToBoard(issueId: number, boardId: number) {
    const issue = await prisma_client.issue.findUnique({
        where: { id: issueId },
        select: { id: true, boardId: true },
    });

    return Boolean(issue && issue.boardId === boardId);
}

function removeFromRoom(socket: WebSocket, info: ClientInfo) {
    const boardId = info.boardId;
    if (!boardId) return;

    const room = rooms.get(boardId);
    if (!room) return;

    room.delete(socket);

    // Only tell the room the user left when no other tab of theirs is open here.
    const stillHere = Array.from(room).some(
        (other) => clients.get(other)?.userId === info.userId
    );

    if (!stillHere) {
        for (const other of room) {
            send(other, { type: "leave", userID: info.userId });
        }
    }

    if (room.size === 0) {
        rooms.delete(boardId);
    }
}

async function joinBoard(socket: WebSocket, info: ClientInfo, boardId: number) {
    const board = await getBoardForUser(info.userId, boardId);

    if (!board) {
        send(socket, { type: "error", message: "You do not have access to this board" });
        return;
    }

    if (info.boardId && info.boardId !== boardId) {
        removeFromRoom(socket, info);
    }

    let room = rooms.get(boardId);
    if (!room) {
        room = new Set<WebSocket>();
        rooms.set(boardId, room);
    }

    const existingUsers = Array.from(room)
        .filter((other) => other !== socket)
        .map((other) => ({ id: clients.get(other)?.userId }))
        .filter((user) => user.id !== undefined);

    send(socket, { type: "init_room", users: existingUsers });

    if (!room.has(socket)) {
        for (const other of room) {
            send(other, { type: "join", userID: info.userId });
        }
        room.add(socket);
    }

    info.boardId = boardId;
    info.orgId = board.organizationId;

    const issues = await prisma_client.issue.findMany({
        where: { boardId },
        orderBy: { createdAt: "asc" },
    });

    send(socket, { type: "initial_state", all_issues: issues });
}

const httpServer = createServer((req, res) => {
    // Render uses this route as the health check.
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "sprintly-ws" }));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocketServer({ server: httpServer, maxPayload: 1024 * 1024 });

wss.on("connection", async (socket, req) => {
    const url = new URL(req.url || "/", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
        socket.close(1008, "Unauthorized: token missing");
        return;
    }

    let userId: number;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId?: number;
            userid?: number;
        };
        const rawId = decoded.userId !== undefined ? decoded.userId : decoded.userid;
        const parsedId = Number(rawId);

        if (!Number.isInteger(parsedId) || parsedId <= 0) {
            socket.close(1008, "Unauthorized: invalid token");
            return;
        }

        userId = parsedId;
    } catch (error) {
        socket.close(1008, "Unauthorized: invalid token");
        return;
    }

    const info: ClientInfo = {
        userId,
        userName: `User #${userId}`,
        boardId: null,
        orgId: null,
        isAlive: true,
    };

    clients.set(socket, info);

    // The browser sends "join" right after the socket opens. Buffer messages
    // until the user lookup below finishes so that first message is not lost.
    let resolveReady!: () => void;
    const ready = new Promise<void>((resolve) => {
        resolveReady = resolve;
    });
    let authorized = false;

    socket.on("pong", () => {
        info.isAlive = true;
    });

    socket.on("error", (error) => {
        console.error("WebSocket socket error:", error);
    });

    socket.on("close", () => {
        removeFromRoom(socket, info);
        clients.delete(socket);
    });

    socket.on("message", async (raw) => {
        await ready;
        if (!authorized) return;

        let message: Record<string, unknown>;

        try {
            const parsed = JSON.parse(raw.toString());
            if (!parsed || typeof parsed !== "object" || typeof parsed.type !== "string") {
                send(socket, { type: "error", message: "Invalid message" });
                return;
            }
            message = parsed;
        } catch (error) {
            send(socket, { type: "error", message: "Invalid JSON" });
            return;
        }

        try {
            if (message.type === "join") {
                const boardId = asPositiveInt(message.boardID);
                if (!boardId) {
                    send(socket, { type: "error", message: "Valid boardID is required" });
                    return;
                }
                await joinBoard(socket, info, boardId);
                return;
            }

            // Everything else requires a joined board.
            if (!info.boardId) {
                send(socket, { type: "error", message: "Join a board first" });
                return;
            }

            const boardId = info.boardId;

            if (message.type === "issue_added") {
                const title = asString(message.title).trim();
                const status = parseStatus(message.status) || "TODO";

                if (!title) {
                    send(socket, { type: "error", message: "Issue title is required" });
                    return;
                }

                if (title.length > 200) {
                    send(socket, { type: "error", message: "Issue title is too long" });
                    return;
                }

                const issue = await prisma_client.issue.create({
                    data: {
                        title,
                        status,
                        boardId,
                        userId: info.userId,
                    },
                });

                broadcast(boardId, { type: "issue_added", issue });
                return;
            }

            if (message.type === "issue_moved") {
                const issueId = asPositiveInt(message.issueId);
                const newStatus = parseStatus(message.newStatus);

                if (!issueId || !newStatus) {
                    send(socket, { type: "error", message: "Valid issueId and status are required" });
                    return;
                }

                if (!(await issueBelongsToBoard(issueId, boardId))) {
                    send(socket, { type: "error", message: "Issue not found on this board" });
                    return;
                }

                await prisma_client.issue.update({
                    where: { id: issueId },
                    data: { status: newStatus },
                });

                broadcast(boardId, {
                    type: "issue_moved",
                    issueId,
                    newStatus,
                });
                return;
            }

            if (message.type === "delete_issue") {
                const issueId = asPositiveInt(message.issueId);

                if (!issueId) {
                    send(socket, { type: "error", message: "Valid issueId is required" });
                    return;
                }

                const issue = await prisma_client.issue.findUnique({
                    where: { id: issueId },
                    select: { boardId: true },
                });

                if (issue && issue.boardId !== boardId) {
                    send(socket, { type: "error", message: "Issue not found on this board" });
                    return;
                }

                // deleteMany keeps this idempotent: the REST API may have
                // already deleted the issue before this message arrives.
                await prisma_client.issue.deleteMany({
                    where: { id: issueId, boardId },
                });

                broadcast(boardId, { type: "delete_issue", issueId });
                return;
            }

            if (message.type === "comment_added") {
                const issueId = asPositiveInt(message.issueId);
                const content = asString(message.content).trim();

                if (!issueId || !content) {
                    send(socket, { type: "error", message: "Valid issueId and content are required" });
                    return;
                }

                if (content.length > 5000) {
                    send(socket, { type: "error", message: "Comment is too long" });
                    return;
                }

                if (!(await issueBelongsToBoard(issueId, boardId))) {
                    send(socket, { type: "error", message: "Issue not found on this board" });
                    return;
                }

                const comment = await prisma_client.comment.create({
                    data: {
                        content,
                        issueId,
                        userId: info.userId,
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

                broadcast(boardId, {
                    type: "comment_added",
                    comment,
                    issueId,
                    clientTempId: typeof message.clientTempId === "string" ? message.clientTempId : null,
                });
                return;
            }

            if (message.type === "typing") {
                const issueId = asPositiveInt(message.issueId);

                if (!issueId) return;

                // Use the name from the database, not the client payload.
                broadcast(boardId, {
                    type: "user_typing",
                    userID: info.userId,
                    userName: info.userName,
                    issueId,
                });
                return;
            }

            if (message.type === "issue_updated") {
                const issueId = asPositiveInt(message.issueId);

                if (!issueId) {
                    send(socket, { type: "error", message: "Valid issueId is required" });
                    return;
                }

                if (!(await issueBelongsToBoard(issueId, boardId))) {
                    send(socket, { type: "error", message: "Issue not found on this board" });
                    return;
                }

                const updates: {
                    title?: string;
                    description?: string;
                    status?: IssueStatus;
                } = {};

                if (message.title !== undefined) {
                    const title = asString(message.title).trim();
                    if (!title || title.length > 200) {
                        send(socket, { type: "error", message: "Invalid title" });
                        return;
                    }
                    updates.title = title;
                }

                if (message.description !== undefined) {
                    const description = asString(message.description);
                    if (description.length > 5000) {
                        send(socket, { type: "error", message: "Description is too long" });
                        return;
                    }
                    updates.description = description;
                }

                if (message.status !== undefined) {
                    const status = parseStatus(message.status);
                    if (!status) {
                        send(socket, { type: "error", message: "Invalid status" });
                        return;
                    }
                    updates.status = status;
                }

                if (Object.keys(updates).length === 0) {
                    return;
                }

                await prisma_client.issue.update({
                    where: { id: issueId },
                    data: updates,
                });

                broadcast(boardId, {
                    type: "issue_updated",
                    issueId,
                    ...updates,
                    updatedBy: info.userName,
                });
                return;
            }

            send(socket, { type: "error", message: "Unknown message type" });
        } catch (error) {
            // Never broadcast a fake success when the database write failed.
            console.error("WebSocket message error:", error);
            send(socket, { type: "error", message: "Request failed" });
        }
    });

    // Finish auth after listeners are attached. Messages wait on `ready`.
    try {
        const user = await prisma_client.users.findUnique({
            where: { id: userId },
            select: { firstname: true, lastname: true },
        });

        if (!user) {
            socket.close(1008, "Unauthorized: user not found");
            return;
        }

        info.userName = `${user.firstname} ${user.lastname}`.trim() || `User #${userId}`;
        authorized = true;
    } catch (error) {
        console.error("WebSocket auth lookup failed:", error);
        socket.close(1011, "Server error");
        return;
    } finally {
        resolveReady();
    }
});

// Detect dead connections.
const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
        const info = clients.get(socket);
        if (!info) continue;

        if (!info.isAlive) {
            socket.terminate();
            continue;
        }

        info.isAlive = false;
        socket.ping();
    }
}, 30000);

wss.on("close", () => {
    clearInterval(heartbeat);
});

function shutdown() {
    clearInterval(heartbeat);
    wss.close();
    httpServer.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Sprintly WebSocket server is running on port ${PORT}`);
});
