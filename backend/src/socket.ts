import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Handle joining dedicated user rooms
        socket.on('join_user_room', (userId: string) => {
            console.log(`[Socket] User ${userId} joined their personal room.`);
            socket.join(`user_${userId}`);
        });

        // Handle joining department/class rooms (optional, useful for broadcast)
        socket.on('join_department_room', (departmentId: string) => {
             console.log(`[Socket] Client joined department room: ${departmentId}`);
             socket.join(`dept_${departmentId}`);
        });

        socket.on('disconnect', () => {
             console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};
