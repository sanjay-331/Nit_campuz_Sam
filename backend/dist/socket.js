"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: [
                'https://nit-campuz.vercel.app',
                process.env.VITE_FRONTEND_URL || "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4000",
                "http://localhost:4001"
            ],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        // Handle joining dedicated user rooms
        socket.on('join_user_room', (userId) => {
            console.log(`[Socket] User ${userId} joined their personal room.`);
            socket.join(`user_${userId}`);
        });
        // Handle joining department/class rooms (optional, useful for broadcast)
        socket.on('join_department_room', (departmentId) => {
            console.log(`[Socket] Client joined department room: ${departmentId}`);
            socket.join(`dept_${departmentId}`);
        });
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};
exports.getIO = getIO;
