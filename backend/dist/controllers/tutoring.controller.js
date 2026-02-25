"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookTutoringSession = exports.approveTutorApplication = exports.getAllTutoringSessions = exports.getAllTutorApplications = exports.getAllTutors = void 0;
const index_1 = require("../index");
const getAllTutors = async (req, res) => {
    try {
        const tutors = await index_1.prisma.tutor.findMany();
        res.json(tutors);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllTutors = getAllTutors;
const getAllTutorApplications = async (req, res) => {
    try {
        const applications = await index_1.prisma.tutorApplication.findMany();
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllTutorApplications = getAllTutorApplications;
const getAllTutoringSessions = async (req, res) => {
    try {
        const sessions = await index_1.prisma.tutoringSession.findMany();
        const mappedSessions = sessions.map((s) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllTutoringSessions = getAllTutoringSessions;
const approveTutorApplication = async (req, res) => {
    try {
        const id = req.params.id;
        const application = await index_1.prisma.tutorApplication.findUnique({ where: { id } });
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        if (application.status === 'approved') {
            res.status(400).json({ message: 'Application is already approved' });
            return;
        }
        // Update application status
        await index_1.prisma.tutorApplication.update({
            where: { id },
            data: { status: 'approved' }
        });
        // Create tutor profile
        const newTutor = await index_1.prisma.tutor.create({
            data: {
                studentId: application.studentId,
                subjects: application.subjects,
                rating: 5.0,
                bio: application.statement,
            }
        });
        res.json(newTutor);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.approveTutorApplication = approveTutorApplication;
const bookTutoringSession = async (req, res) => {
    try {
        const { tutorId, studentId, subject, date, time } = req.body;
        if (!tutorId || !studentId || !subject || !date || !time) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const scheduledAt = new Date(`${date}T${time}:00.000Z`);
        const newSession = await index_1.prisma.tutoringSession.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bookTutoringSession = bookTutoringSession;
