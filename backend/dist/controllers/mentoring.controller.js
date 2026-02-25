"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemark = exports.getAllRemarks = exports.updateMentorAssignment = exports.autoAssignMentees = exports.getAllMentorAssignments = void 0;
const index_1 = require("../index");
const client_1 = require("@prisma/client");
const getAllMentorAssignments = async (req, res) => {
    try {
        const assignments = await index_1.prisma.mentorAssignment.findMany();
        res.json(assignments);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllMentorAssignments = getAllMentorAssignments;
const autoAssignMentees = async (req, res) => {
    try {
        const { departmentId } = req.body;
        if (!departmentId) {
            res.status(400).json({ message: 'Missing departmentId' });
            return;
        }
        const deptFaculty = await index_1.prisma.user.findMany({
            where: { departmentId, role: client_1.UserRole.STAFF }
        });
        const deptStudents = await index_1.prisma.user.findMany({
            where: { departmentId, role: client_1.UserRole.STUDENT }
        });
        if (deptFaculty.length === 0) {
            res.status(400).json({ message: 'No faculty available in this department to assign as mentors.' });
            return;
        }
        // Delete existing assignments for students in this department
        const studentIds = deptStudents.map((s) => s.id);
        await index_1.prisma.mentorAssignment.deleteMany({
            where: { studentId: { in: studentIds } }
        });
        const newAssignmentsData = [];
        let facultyIndex = 0;
        for (const student of deptStudents) {
            newAssignmentsData.push({
                studentId: student.id,
                mentorId: deptFaculty[facultyIndex].id,
            });
            facultyIndex = (facultyIndex + 1) % deptFaculty.length;
        }
        await index_1.prisma.mentorAssignment.createMany({
            data: newAssignmentsData
        });
        // Return updated assignments
        const allAssignments = await index_1.prisma.mentorAssignment.findMany();
        res.json({ message: 'Mentees have been auto-assigned.', assignments: allAssignments });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.autoAssignMentees = autoAssignMentees;
const updateMentorAssignment = async (req, res) => {
    try {
        const { studentId, newMentorId } = req.body;
        if (!studentId || !newMentorId) {
            res.status(400).json({ message: 'Missing studentId or newMentorId' });
            return;
        }
        const assignment = await index_1.prisma.mentorAssignment.upsert({
            where: { studentId },
            update: { mentorId: newMentorId },
            create: { studentId, mentorId: newMentorId }
        });
        res.json(assignment);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMentorAssignment = updateMentorAssignment;
const getAllRemarks = async (req, res) => {
    try {
        const remarks = await index_1.prisma.remark.findMany();
        res.json(remarks);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllRemarks = getAllRemarks;
const createRemark = async (req, res) => {
    try {
        const { studentId, mentorId, text } = req.body;
        if (!studentId || !mentorId || !text) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const newRemark = await index_1.prisma.remark.create({
            data: { studentId, mentorId, text }
        });
        res.json(newRemark);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createRemark = createRemark;
