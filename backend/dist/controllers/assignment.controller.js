"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkAssignTopics = exports.gradeSubmission = exports.submitAssignment = exports.getAllSubmissions = exports.createAssignment = exports.getAllAssignments = void 0;
const db_1 = require("../db");
const socket_1 = require("../socket");
const getAllAssignments = async (req, res) => {
    try {
        const assignments = await db_1.prisma.assignment.findMany();
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
        const assignment = await db_1.prisma.assignment.create({
            data: {
                courseId,
                title,
                dueDate: new Date(dueDate),
            }
        });
        // Emit real-time notification
        try {
            const io = (0, socket_1.getIO)();
            io.emit('notification', {
                type: 'Assignment',
                message: `New assignment posted: ${title}`,
                courseId: courseId
            });
        }
        catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }
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
        const submissions = await db_1.prisma.submission.findMany();
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
        const existing = await db_1.prisma.submission.findFirst({
            where: { assignmentId: String(assignmentId), studentId: String(studentId) }
        });
        let submission;
        if (existing) {
            submission = await db_1.prisma.submission.update({
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
            submission = await db_1.prisma.submission.create({
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
        const existing = await db_1.prisma.submission.findFirst({
            where: { assignmentId: String(assignmentId), studentId: String(studentId) }
        });
        if (!existing) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }
        const submission = await db_1.prisma.submission.update({
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
const bulkAssignTopics = async (req, res) => {
    try {
        const { courseId, assignments } = req.body;
        const results = [];
        for (const item of assignments) {
            const { studentId, topic, remarks } = item;
            // Find existing submission for any assignment in this course
            const assignment = await db_1.prisma.assignment.findFirst({ where: { courseId } });
            if (!assignment)
                continue;
            const existing = await db_1.prisma.submission.findFirst({
                where: { assignmentId: assignment.id, studentId }
            });
            if (existing) {
                const updated = await db_1.prisma.submission.update({
                    where: { id: existing.id },
                    data: { topic, remarks }
                });
                results.push(updated);
            }
            else {
                const created = await db_1.prisma.submission.create({
                    data: {
                        assignmentId: assignment.id,
                        studentId,
                        topic,
                        remarks,
                        status: 'Not Submitted'
                    }
                });
                results.push(created);
            }
        }
        res.json({ message: `Successfully assigned topics to ${results.length} students`, data: results });
    }
    catch (error) {
        console.error('Error bulk assigning topics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bulkAssignTopics = bulkAssignTopics;
