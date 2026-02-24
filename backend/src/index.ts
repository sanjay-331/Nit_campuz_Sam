import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NIT Campuz Backend is running.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export { app, prisma };
