import { WebSocketServer, WebSocket } from "ws";
import { prisma_client } from "database";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT! || 8080);

const server = new WebSocketServer({ port: PORT! });

interface RoomUser {
    userID: number;
    socket: WebSocket;
}

type RoomsMap = Record<string | number, RoomUser[]>;

interface Issue {
    id: number;
    title: string;
    status: any;
    boardId?: number;
    userId?: number;
}

const ROOMS: RoomsMap = {};
let connections: WebSocket[] = [];

// Global In-Memory Issues Cache (shared across all boards)
let ISSUES: Issue[] = [];

server.on("connection", async (socket: WebSocket, req) => {
    // Extract token from URL query string
    const urlParams = new URLSearchParams(req.url?.split("?")[1]);
    const token = urlParams.get("token");

    if (!token) {
        socket.close(1008, "Unauthorized: Token missing");
        return;
    }

    let userid: number;

    try {
        const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
        const decodedtoken = jwt.verify(token, JWT_SECRET) as { userid: number; userId?: number };
        userid = decodedtoken.userid || decodedtoken.userId!;
    } catch (error) {
        socket.close(1008, "Unauthorized: Invalid token");
        return;
    }

    connections.push(socket);

    socket.on("message", async (data) => {
        try {
            const parseddata = JSON.parse(data.toString());

            // JOIN ROOM — fetch board issues from DB, push to ISSUES, send initial_state, broadcast join

            if (parseddata.type === "join") {
                const boardID = parseddata.boardID;
                if (!ROOMS[boardID]) {
                    ROOMS[boardID] = [];
                }

                // Notify existing room members that this user joined
                ROOMS[boardID].forEach((existingUser) => {
                    if (existingUser.socket.readyState === existingUser.socket.OPEN) {
                        existingUser.socket.send(
                            JSON.stringify({
                                type: "join",
                                userID: userid,
                            })
                        );
                    }
                });

                // Send existing active room users to the newly joined user
                const existingUserIDs = ROOMS[boardID].map((u) => ({ id: u.userID }));
                socket.send(
                    JSON.stringify({
                        type: "init_room",
                        users: existingUserIDs,
                    })
                );

                // Add user to room
                ROOMS[boardID].push({
                    userID: userid,
                    socket: socket,
                });

                console.log(`User ${userid} joined board room ${boardID}`);

                // Fetch all issues for THIS BOARD from DB, push into global ISSUES if not already there
                try {
                    const boardIssues = await prisma_client.issue.findMany({
                        where: {
                            boardId: Number(boardID)
                        }
                    });

                    boardIssues.forEach((issue: any) => {
                        if (!ISSUES.some(i => i.id === issue.id)) {
                            ISSUES.push({
                                id: issue.id,
                                title: issue.title,
                                status: issue.status,
                                boardId: issue.boardId,
                                userId: issue.userId,
                            });
                        }
                    });
                } catch (error) {
                    console.log("DB Fetch fallback:", error);
                }

                // Send initial_state with only THIS BOARD's issues to the joining user
                const boardSpecificIssues = ISSUES.filter(i => String(i.boardId) === String(boardID));
                socket.send(
                    JSON.stringify({
                        type: "initial_state",
                        all_issues: boardSpecificIssues,
                    })
                );
            }

            // ADD NEW ISSUE — save to DB, push to ISSUES, broadcast to board room only

            if (parseddata.type === "issue_added") {
                const { title, status, boardID } = parseddata;

                let dbIssue: any = null;
                try {
                    dbIssue = await prisma_client.issue.create({
                        data: {
                            title: title || "New Issue",
                            status: status,
                            boardId: Number(boardID),
                            userId: userid,
                        }
                    });
                    console.log(`DB Created Issue ${dbIssue.id}`);
                } catch (dbErr) {
                    console.log("DB create issue error:", dbErr);
                }

                const newIssue: Issue = {
                    id: dbIssue ? dbIssue.id : Date.now(),
                    title: title,
                    status: status,
                    boardId: Number(boardID),
                    userId: userid,
                };

                ISSUES.push(newIssue);
                console.log(`Issue created by User ${userid}:`, newIssue);

                // Broadcast to only members in this board room
                const targetRoom = ROOMS[boardID] || [];
                targetRoom.forEach((user) => {
                    if (user.socket.readyState === user.socket.OPEN) {
                        user.socket.send(
                            JSON.stringify({
                                type: "issue_added",
                                issue: newIssue,
                            })
                        );
                    }
                });
            }

            // MOVE / UPDATE ISSUE STATUS — update DB, update ISSUES, broadcast to board room only

            if (parseddata.type === "issue_moved") {
                const { issueId, newStatus, boardID } = parseddata;

                try {
                    await prisma_client.issue.update({
                        where: { id: Number(issueId) },
                        data: { status: newStatus }
                    });
                    console.log(`DB Updated Issue ${issueId} to status: ${newStatus}`);
                } catch (dbErr) {
                    console.log("DB update issue error:", dbErr);
                }

                // Update in memory ISSUES array
                ISSUES = ISSUES.map((item) =>
                    item.id === Number(issueId) ? { ...item, status: newStatus } : item
                );

                console.log(`User ${userid} moved Issue ${issueId} to status: ${newStatus}`);

                // Broadcast to only members in this board room
                const targetRoom = ROOMS[boardID] || [];
                targetRoom.forEach((user) => {
                    if (user.socket.readyState === user.socket.OPEN) {
                        user.socket.send(
                            JSON.stringify({
                                type: "issue_moved",
                                issueId: Number(issueId),
                                newStatus: newStatus,
                            })
                        );
                    }
                });
            }

            // DELETE ISSUE — delete from DB, remove from ISSUES, broadcast to board room only

            if (parseddata.type === "delete_issue") {
                const { issueId, boardID } = parseddata;

                try {
                    await prisma_client.issue.delete({
                        where: { id: Number(issueId) }
                    });
                    console.log(`DB Deleted Issue ${issueId}`);
                } catch (dbErr) {
                    console.log("DB delete issue error:", dbErr);
                }

                // Remove from memory ISSUES array
                ISSUES = ISSUES.filter((item) => item.id !== Number(issueId));
                console.log(`User ${userid} deleted Issue ${issueId}`);

                // Broadcast to only members in this board room
                const targetRoom = ROOMS[boardID] || [];
                targetRoom.forEach((user) => {
                    if (user.socket.readyState === user.socket.OPEN) {
                        user.socket.send(
                            JSON.stringify({
                                type: "delete_issue",
                                issueId: issueId,
                            })
                        );
                    }
                });
            }
        } catch (err) {
            console.error("Error processing WebSocket message:", err);
        }
    });

    // CLEANUP ON DISCONNECT

    socket.on("close", () => {
        connections = connections.filter((s) => s !== socket);

        Object.keys(ROOMS).forEach((roomid) => {
            const users = ROOMS[roomid];
            if (!users) return;

            const userexisted = users.find((u) => u.socket === socket);

            if (userexisted) {
                console.log(`User ${userexisted.userID} left room ${roomid}`);

                ROOMS[roomid] = users.filter((u) => u.socket !== socket);

                ROOMS[roomid].forEach((user) => {
                    if (user.socket.readyState === user.socket.OPEN) {
                        user.socket.send(
                            JSON.stringify({
                                type: "leave",
                                userID: userexisted.userID,
                            })
                        );
                    }
                });

                if (ROOMS[roomid].length === 0) {
                    delete ROOMS[roomid];
                }
            }
        });
    });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
