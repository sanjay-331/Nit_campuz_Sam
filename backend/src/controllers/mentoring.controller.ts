import { Request, Response } from 'express';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';

export const getAllMentorAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const assignments = await prisma.mentorAssignment.findMany();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const autoAssignMentees = async (req: Request, res: Response): Promise<void> => {
    try {
        const { departmentId } = req.body;
        if (!departmentId) {
            res.status(400).json({ message: 'Missing departmentId' });
            return;
        }

        const deptFaculty = await prisma.user.findMany({
            where: { departmentId, role: UserRole.STAFF }
        });
        
        const deptStudents = await prisma.user.findMany({
            where: { departmentId, role: UserRole.STUDENT }
        });

        if (deptFaculty.length === 0) {
            res.status(400).json({ message: 'No faculty available in this department to assign as mentors.' });
            return;
        }

        // Delete existing assignments for students in this department
        const studentIds = deptStudents.map(s => s.id);
        await prisma.mentorAssignment.deleteMany({
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

        await prisma.mentorAssignment.createMany({
            data: newAssignmentsData
        });

        // Return updated assignments
        const allAssignments = await prisma.mentorAssignment.findMany();
        res.json({ message: 'Mentees have been auto-assigned.', assignments: allAssignments });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMentorAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, newMentorId } = req.body;
        if (!studentId || !newMentorId) {
            res.status(400).json({ message: 'Missing studentId or newMentorId' });
            return;
        }

        const assignment = await prisma.mentorAssignment.upsert({
            where: { studentId },
            update: { mentorId: newMentorId },
            create: { studentId, mentorId: newMentorId }
        });
        
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllRemarks = async (req: Request, res: Response): Promise<void> => {
    try {
        const remarks = await prisma.remark.findMany();
        res.json(remarks);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createRemark = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, mentorId, text } = req.body;
        if (!studentId || !mentorId || !text) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const newRemark = await prisma.remark.create({
            data: { studentId, mentorId, text }
        });
        res.json(newRemark);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
