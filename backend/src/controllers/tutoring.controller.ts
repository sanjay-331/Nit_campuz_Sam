import { Request, Response } from 'express';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';

export const getAllTutors = async (req: Request, res: Response): Promise<void> => {
    try {
        const tutors = await prisma.tutor.findMany();
        res.json(tutors);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllTutorApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const applications = await prisma.tutorApplication.findMany();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllTutoringSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const sessions = await prisma.tutoringSession.findMany();
        const mappedSessions = sessions.map(s => {
            const dateObj = new Date(s.scheduledAt);
            return {
                id: s.id,
                tutorId: s.tutorId,
                studentId: s.studentId,
                subject: s.subject,
                status: s.status,
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toISOString().split('T')[1].substring(0, 5)
            };
        });
        res.json(mappedSessions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const approveTutorApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const application = await prisma.tutorApplication.findUnique({ where: { id } });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        if (application.status === 'approved') {
            res.status(400).json({ message: 'Application is already approved' });
            return;
        }

        // Update application status
        await prisma.tutorApplication.update({
            where: { id },
            data: { status: 'approved' }
        });

        // Create tutor profile
        const newTutor = await prisma.tutor.create({
            data: {
                studentId: application.studentId,
                subjects: application.subjects as any,
                rating: 5.0,
                bio: application.statement,
            }
        });

        res.json(newTutor);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const bookTutoringSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tutorId, studentId, subject, date, time } = req.body;

        if (!tutorId || !studentId || !subject || !date || !time) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const scheduledAt = new Date(`${date}T${time}:00.000Z`);

        const newSession = await prisma.tutoringSession.create({
            data: { tutorId, studentId, subject, scheduledAt, status: 'upcoming' }
        });
        
        res.json({
            id: newSession.id,
            tutorId: newSession.tutorId,
            studentId: newSession.studentId,
            subject: newSession.subject,
            status: newSession.status,
            date,
            time
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
