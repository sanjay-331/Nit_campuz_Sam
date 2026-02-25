import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import academicRoutes from './routes/academic.routes';
import assignmentRoutes from './routes/assignment.routes';
import mentoringRoutes from './routes/mentoring.routes';
import tutoringRoutes from './routes/tutoring.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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
            'http://localhost:3000'
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

// Basic healthcheck route
app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', message: 'NIT Campuz Backend is running.' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export { app, prisma };
