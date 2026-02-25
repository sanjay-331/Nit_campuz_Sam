import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: ['https://nit-campuz.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import academicRoutes from './routes/academic.routes';
import assignmentRoutes from './routes/assignment.routes';
import mentoringRoutes from './routes/mentoring.routes';
import tutoringRoutes from './routes/tutoring.routes';
import adminRoutes from './routes/admin.routes';

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export { app, prisma };
