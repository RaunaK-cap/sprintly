import { WebSocketServer } from "ws";
import { prisma_client } from "database";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", (socket) => {
    console.log("new connection");
    socket.send("hello");
})


