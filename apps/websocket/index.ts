import { WebSocketServer, type WebSocket } from "ws";
import { prisma_client } from "database";

const server = new WebSocketServer({ port: 8080 });

interface RoomUser {
  userID: number;
  socket: WebSocket;
}

type RoomsMap = Record<string | number, RoomUser[]>;

interface Issue {
  id: number;
  title: string;
  status: "todo" | "inprogreess" | "done";
  boardId?: number;
}

const ROOMS: RoomsMap = {};
let connections: WebSocket[] = [];

// ----------------------------------------------------------------------
// 📦 Dummy In-Memory Database (Fallback until Database calls are wired)
// ----------------------------------------------------------------------
let ISSUES: Issue[] = [
  {
    id: 1,
    title: "Setup Monorepo & Auth Backend",
    status: "done",
    boardId: 1,
  },
  {
    id: 2,
    title: "Implement Real-time WebSocket Rooms",
    status: "inprogreess",
    boardId: 1,
  },
  {
    id: 3,
    title: "Design Frontend Drag-and-Drop Board",
    status: "todo",
    boardId: 1,
  },
];

server.on("connection", (socket: WebSocket) => {
  connections.push(socket);

  // ----------------------------------------------------------------------
  // 1️⃣ INITIAL STATE / GET ALL ISSUES
  // ----------------------------------------------------------------------
  // Send existing issues immediately upon connection
  // 💾 DB FUTURE CALL:
  // const dbIssues = await prisma_client.issue.findMany({ where: { boardId: ... } });
  socket.send(
    JSON.stringify({
      type: "initial_state",
      all_issues: ISSUES,
    })
  );

  socket.on("message", (data) => {
    try {
      const parseddata = JSON.parse(data.toString());

      // ------------------------------------------------------------------
      // 2️⃣ JOIN ROOM (BOARD SYNCHRONIZATION)
      // ------------------------------------------------------------------
      if (parseddata.type === "join") {
        const boardID = parseddata.boardID;
        if (!ROOMS[boardID]) {
          ROOMS[boardID] = [];
        }

        const newuserID = Math.floor(Math.random() * 10000); // Placeholder until JWT decoding

        // Notify existing room members that a user joined
        ROOMS[boardID].forEach((existingUser) => {
          if (existingUser.socket.readyState === existingUser.socket.OPEN) {
            existingUser.socket.send(
              JSON.stringify({
                type: "join",
                userID: newuserID,
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
          userID: newuserID,
          socket: socket,
        });

        console.log(`User ${newuserID} joined board room ${boardID}`);
      }

      // ------------------------------------------------------------------
      // 3️⃣ ADD NEW ISSUE LOGIC
      // ------------------------------------------------------------------
      if (parseddata.type === "issue_added") {
        const { title, status, boardID } = parseddata;

        // 💾 DB FUTURE CALL:
        // const createdIssue = await prisma_client.issue.create({
        //   data: {
        //     title: title,
        //     status: status || "TODO",
        //     boardId: Number(boardID),
        //   }
        // });

        const newIssue: Issue = {
          id: Date.now(), // Simulated unique ID
          title: title || "New Issue",
          status: status || "todo",
          boardId: boardID,
        };

        ISSUES.push(newIssue);
        console.log("Issue created:", newIssue);

        // Broadcast new issue to everyone in the room (or all connections)
        const targetRoom = ROOMS[boardID] || [];
        const recipients = targetRoom.length > 0 ? targetRoom.map((u) => u.socket) : connections;

        recipients.forEach((clientSocket) => {
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(
              JSON.stringify({
                type: "issue_added",
                issue: newIssue,
              })
            );
          }
        });
      }

      // ------------------------------------------------------------------
      // 4️⃣ MOVE / UPDATE ISSUE STATUS LOGIC
      // ------------------------------------------------------------------
      if (parseddata.type === "issue_moved") {
        const { issueId, newStatus, boardID } = parseddata;

        // 💾 DB FUTURE CALL:
        // await prisma_client.issue.update({
        //   where: { id: Number(issueId) },
        //   data: { status: newStatus }
        // });

        // Update in dummy memory
        ISSUES = ISSUES.map((item) =>
          item.id === issueId ? { ...item, status: newStatus } : item
        );

        console.log(`Issue ${issueId} moved to status: ${newStatus}`);

        // Broadcast status update to room
        const targetRoom = ROOMS[boardID] || [];
        const recipients = targetRoom.length > 0 ? targetRoom.map((u) => u.socket) : connections;

        recipients.forEach((clientSocket) => {
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(
              JSON.stringify({
                type: "issue_moved",
                issueId: issueId,
                newStatus: newStatus,
              })
            );
          }
        });
      }

      // ------------------------------------------------------------------
      // 5️⃣ DELETE ISSUE LOGIC
      // ------------------------------------------------------------------
      if (parseddata.type === "delete_issue") {
        const { issueId, boardID } = parseddata;

        // 💾 DB FUTURE CALL:
        // await prisma_client.issue.delete({
        //   where: { id: Number(issueId) }
        // });

        // Remove from dummy memory
        ISSUES = ISSUES.filter((item) => item.id !== issueId);
        console.log(`Issue ${issueId} deleted`);

        // Broadcast deletion to room
        const targetRoom = ROOMS[boardID] || [];
        const recipients = targetRoom.length > 0 ? targetRoom.map((u) => u.socket) : connections;

        recipients.forEach((clientSocket) => {
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(
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

  // ----------------------------------------------------------------------
  // 6️⃣ CLEANUP ON DISCONNECT
  // ----------------------------------------------------------------------
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

console.log("WebSocket server is running on ws://localhost:8080");
