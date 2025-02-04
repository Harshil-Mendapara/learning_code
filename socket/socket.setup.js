const { Server } = require("socket.io");

let io;

const setIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};


const emitToSocket = (event, data, socketId = null) => {
    const ioInstance = getIo();

    if (socketId) {
        ioInstance.to(socketId).emit(event, data);
        console.log(`Emitted event '${event}' to socket ID ${socketId}`);
    } else {
        ioInstance.emit(event, data);
        console.log(`Emitted event '${event}' to all sockets`);
    }
};

module.exports = { setIo, getIo, emitToSocket };
