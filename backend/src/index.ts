import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';
import { initSocket } from './socket';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import academicRoutes from './routes/academic.routes';
import assignmentRoutes from './routes/assignment.routes';
import mentoringRoutes from './routes/mentoring.routes';
import tutoringRoutes from './routes/tutoring.routes';
import adminRoutes from './routes/admin.routes';
import documentRoutes from './routes/document.routes';
import libraryRoutes from './routes/library.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

// Initialize Socket.io
initSocket(server);

// Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://nit-campuz.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:4001'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} not allowed`);
            // Instead of returning an error, we return true but the headers will 
            // naturally fail if we don't handle it. Actually, returning false 
            // is better for standard CORS behavior.
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/mentoring', mentoringRoutes);
app.use('/api/tutoring', tutoringRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/library', libraryRoutes);

// Basic healthcheck route
app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', message: 'NIT Campuz Backend is running.' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export { app, prisma };
