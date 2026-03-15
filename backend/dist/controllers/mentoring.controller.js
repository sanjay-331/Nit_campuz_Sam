"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemark = exports.getAllRemarks = exports.bulkUpdateMentorAssignments = exports.updateMentorAssignment = exports.autoAssignMentees = exports.getMyMentees = exports.getAllMentorAssignments = void 0;
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const sanitizeUser = (user) => {
    if (!user)
        return null;
    const { password, studentProfile, alumniProfile, ...safeUser } = user;
    const rawProfileData = studentProfile || alumniProfile || {};
    const { id: profileId, userId: profileUserId, ...profileData } = rawProfileData;
    return {
        ...safeUser,
        ...profileData
    };
};
const getAllMentorAssignments = async (req, res) => {
    try {
        const currentUser = req.user;
        const baseWhere = currentUser?.role === client_1.UserRole.STUDENT
            ? { studentId: currentUser.id }
            : undefined;
        const assignments = await db_1.prisma.mentorAssignment.findMany({
            where: baseWhere
        });
        if (assignments.length === 0) {
            res.json([]);
            return;
        }
        const userIds = Array.from(new Set(assignments.flatMap(a => [a.studentId, a.mentorId])));
        const users = await db_1.prisma.user.findMany({
            where: { id: { in: userIds } },
            include: {
                department: true,
                studentProfile: true,
                alumniProfile: true
            }
        });
        const usersById = new Map(users.map(user => [user.id, sanitizeUser(user)]));
        const scopedAssignments = assignments.filter(assignment => {
            const student = usersById.get(assignment.studentId);
            const mentor = usersById.get(assignment.mentorId);
            if (!student || !mentor)
                return false;
            if (currentUser?.role === client_1.UserRole.HOD || currentUser?.role === client_1.UserRole.STAFF) {
                return !!currentUser.departmentId && student.departmentId === currentUser.departmentId;
            }
            return true;
        }).map(assignment => ({
            ...assignment,
            student: usersById.get(assignment.studentId) || undefined
        }));
        res.json(scopedAssignments);
    }
    catch (error) {
        console.error('Error fetching mentor assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllMentorAssignments = getAllMentorAssignments;
const getMyMentees = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const mentees = await db_1.prisma.mentorAssignment.findMany({
            where: { mentorId }
        });
        if (mentees.length === 0) {
            res.json([]);
            return;
        }
        const studentIds = mentees.map(m => m.studentId);
        const students = await db_1.prisma.user.findMany({
            where: { id: { in: studentIds } },
            include: {
                studentProfile: true,
                department: true
            }
        });
        const studentsById = new Map(students.map(student => [student.id, sanitizeUser(student)]));
        const sanitizedMentees = mentees
            .filter(assignment => studentsById.has(assignment.studentId))
            .map(assignment => ({
            ...assignment,
            student: studentsById.get(assignment.studentId)
        }));
        res.json(sanitizedMentees);
    }
    catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyMentees = getMyMentees;
const autoAssignMentees = async (req, res) => {
    try {
        const { departmentId } = req.body;
        if (!departmentId) {
            res.status(400).json({ message: 'Missing departmentId' });
            return;
        }
        const deptFaculty = await db_1.prisma.user.findMany({
            where: {
                departmentId,
                role: { in: [client_1.UserRole.STAFF, client_1.UserRole.HOD] }
            }
        });
        const deptStudents = await db_1.prisma.user.findMany({
            where: { departmentId, role: client_1.UserRole.STUDENT }
        });
        if (deptFaculty.length === 0) {
            res.status(400).json({ message: 'No faculty available in this department to assign as mentors.' });
            return;
        }
        if (deptStudents.length === 0) {
            res.status(400).json({ message: 'No students found in this department.' });
            return;
        }
        // Delete existing assignments for students in this department
        const studentIds = deptStudents.map((s) => s.id);
        await db_1.prisma.mentorAssignment.deleteMany({
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
        await db_1.prisma.mentorAssignment.createMany({
            data: newAssignmentsData
        });
        // Return updated assignments
        const allAssignments = await db_1.prisma.mentorAssignment.findMany({
            where: { studentId: { in: studentIds } }
        });
        res.json({ message: 'Mentees have been auto-assigned.', assignments: allAssignments });
    }
    catch (error) {
        console.error('Error auto-assigning mentees:', error);
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
        const [student, mentor] = await Promise.all([
            db_1.prisma.user.findUnique({ where: { id: studentId } }),
            db_1.prisma.user.findUnique({ where: { id: newMentorId } })
        ]);
        if (!student || student.role !== client_1.UserRole.STUDENT) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        if (!mentor || (mentor.role !== client_1.UserRole.STAFF && mentor.role !== client_1.UserRole.HOD)) {
            res.status(404).json({ message: 'Mentor not found' });
            return;
        }
        if (!student.departmentId || student.departmentId !== mentor.departmentId) {
            res.status(400).json({ message: 'Student and mentor must belong to the same department' });
            return;
        }
        const assignment = await db_1.prisma.mentorAssignment.upsert({
            where: { studentId },
            update: { mentorId: newMentorId },
            create: { studentId, mentorId: newMentorId }
        });
        res.json(assignment);
    }
    catch (error) {
        console.error('Error updating mentor assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMentorAssignment = updateMentorAssignment;
const bulkUpdateMentorAssignments = async (req, res) => {
    try {
        const { studentIds, newMentorId } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || !newMentorId) {
            res.status(400).json({ message: 'Missing studentIds array or newMentorId' });
            return;
        }
        const mentor = await db_1.prisma.user.findUnique({
            where: { id: newMentorId }
        });
        if (!mentor || (mentor.role !== client_1.UserRole.STAFF && mentor.role !== client_1.UserRole.HOD)) {
            res.status(404).json({ message: 'Mentor not found' });
            return;
        }
        const students = await db_1.prisma.user.findMany({
            where: { id: { in: studentIds } }
        });
        if (students.length !== studentIds.length) {
            res.status(404).json({ message: 'One or more students were not found' });
            return;
        }
        const invalidStudent = students.find(student => student.role !== client_1.UserRole.STUDENT ||
            !student.departmentId ||
            student.departmentId !== mentor.departmentId);
        if (invalidStudent) {
            res.status(400).json({ message: 'All selected students must belong to the same department as the mentor' });
            return;
        }
        const updates = studentIds.map(studentId => db_1.prisma.mentorAssignment.upsert({
            where: { studentId },
            update: { mentorId: newMentorId },
            create: { studentId, mentorId: newMentorId }
        }));
        await Promise.all(updates);
        res.json({ message: 'Mentors assigned successfully for selected students.' });
    }
    catch (error) {
        console.error('Error bulk updating mentor assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bulkUpdateMentorAssignments = bulkUpdateMentorAssignments;
const getAllRemarks = async (req, res) => {
    try {
        const remarks = await db_1.prisma.remark.findMany();
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
        const newRemark = await db_1.prisma.remark.create({
            data: { studentId, mentorId, text }
        });
        res.json(newRemark);
    }
    catch (error) {
        console.error('Error creating remark:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createRemark = createRemark;
