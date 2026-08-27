import { WebSocketServer } from "ws";

const server = new WebSocketServer()

server.on("connection", (socket) => {
    console.log("new connection");

    socket.send("hello")

})


