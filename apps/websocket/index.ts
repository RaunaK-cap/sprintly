import { WebSocketServer, type WebSocket } from "ws";
import { prisma_client } from "database";

const server = new WebSocketServer({ port: 8080 });

interface RoomUser {
  userID: number;
  socket: WebSocket;
}

type RoomsMap = Record<string | number, RoomUser[]>;

const ROOMS: RoomsMap = {};

server.on("connection", (socket: WebSocket) => {
  socket.on("message", (data) => {
    try {
      const parseddata = JSON.parse(data.toString());

      if (parseddata.type === "join") {
        const boardID = parseddata.boardID;
        if (!ROOMS[boardID]) {
          ROOMS[boardID] = [];
        }

        const newuserID = Math.floor(Math.random() * 10000); // placeholder until JWT decoding

        // 1. Notify all existing users in this board room that a new user joined
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

        // 2. Send the existing users list to the newly joined user
        const existingUserIDs = ROOMS[boardID].map((u) => ({ id: u.userID }));
        socket.send(
          JSON.stringify({
            type: "init_room",
            users: existingUserIDs,
          })
        );

        // 3. Add the new user to ROOMS
        ROOMS[boardID].push({
          userID: newuserID,
          socket: socket,
        });

        console.log(`User ${newuserID} joined board ${boardID}`);
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  socket.on("close", () => {
    Object.keys(ROOMS).forEach((roomid) => {
      const users = ROOMS[roomid];
      if (!users) return;

      const userexisted = users.find((u) => u.socket === socket);

      if (userexisted) {
        console.log(`User ${userexisted.userID} left room ${roomid}`);

        // Remove the disconnected user from ROOMS
        ROOMS[roomid] = users.filter((u) => u.socket !== socket);

        // Notify remaining users in the room
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

        // Delete empty room
        if (ROOMS[roomid].length === 0) {
          delete ROOMS[roomid];
        }
      }
    });
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
