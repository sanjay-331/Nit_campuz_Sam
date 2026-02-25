"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmission = exports.submitAssignment = exports.getAllSubmissions = exports.createAssignment = exports.getAllAssignments = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const getAllAssignments = async (req, res) => {
    try {
        const assignments = await prisma.assignment.findMany();
        res.json(assignments);
    }
    catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllAssignments = getAllAssignments;
const createAssignment = async (req, res) => {
    try {
        const { courseId, title, dueDate } = req.body;
        if (!courseId || !title || !dueDate) {
            res.status(400).json({ message: 'courseId, title, and dueDate are required' });
            return;
        }
        const assignment = await prisma.assignment.create({
            data: {
                courseId,
                title,
                dueDate: new Date(dueDate),
            }
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createAssignment = createAssignment;
const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany();
        // Rename id to match frontend if needed, or just let frontend use assignmentId & studentId
        res.json(submissions);
    }
    catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllSubmissions = getAllSubmissions;
const submitAssignment = async (req, res) => {
    try {
        const assignmentId = String(req.params.assignmentId);
        const { studentId, fileUrl, textSubmission, topic, remarks } = req.body;
        if (!studentId) {
            res.status(400).json({ message: 'studentId is required' });
            return;
        }
        // Check if submission exists
        const existing = await prisma.submission.findFirst({
            where: { assignmentId: String(assignmentId), studentId: String(studentId) }
        });
        let submission;
        if (existing) {
            submission = await prisma.submission.update({
                where: { id: existing.id },
                data: {
                    fileUrl,
                    textSubmission,
                    topic,
                    remarks,
                    submittedAt: new Date(),
                    status: 'Submitted'
                }
            });
        }
        else {
            submission = await prisma.submission.create({
                data: {
                    assignmentId,
                    studentId,
                    fileUrl,
                    textSubmission,
                    topic,
                    remarks,
                    status: 'Submitted',
                    submittedAt: new Date(),
                }
            });
        }
        res.json(submission);
    }
    catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.submitAssignment = submitAssignment;
const gradeSubmission = async (req, res) => {
    try {
        const { assignmentId, studentId, grade } = req.body;
        if (!assignmentId || !studentId || !grade) {
            res.status(400).json({ message: 'assignmentId, studentId, and grade are required' });
            return;
        }
        const existing = await prisma.submission.findFirst({
            where: { assignmentId: String(assignmentId), studentId: String(studentId) }
        });
        if (!existing) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }
        const submission = await prisma.submission.update({
            where: { id: existing.id },
            data: {
                grade,
                status: 'Graded'
            }
        });
        res.json(submission);
    }
    catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.gradeSubmission = gradeSubmission;
