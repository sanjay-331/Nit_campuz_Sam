import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

const sanitizeUser = (user: any) => {
    if (!user) return null;

    const { password, studentProfile, alumniProfile, ...safeUser } = user;
    const rawProfileData = studentProfile || alumniProfile || {};
    const { id: profileId, userId: profileUserId, ...profileData } = rawProfileData;
    return {
        ...safeUser,
        ...profileData
    };
};

export const getAllMentorAssignments = async (req: any, res: Response): Promise<void> => {
    try {
        const currentUser = req.user;
        const baseWhere =
            currentUser?.role === UserRole.STUDENT
                ? { studentId: currentUser.id }
                : undefined;

        const assignments = await prisma.mentorAssignment.findMany({
            where: baseWhere
        });

        if (assignments.length === 0) {
            res.json([]);
            return;
        }

        const userIds = Array.from(new Set(assignments.flatMap(a => [a.studentId, a.mentorId])));
        const users = await prisma.user.findMany({
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
            if (!student || !mentor) return false;

            if (currentUser?.role === UserRole.HOD || currentUser?.role === UserRole.STAFF) {
                return !!currentUser.departmentId && student.departmentId === currentUser.departmentId;
            }

            return true;
        }).map(assignment => ({
            ...assignment,
            student: usersById.get(assignment.studentId) || undefined
        }));

        res.json(scopedAssignments);
    } catch (error) {
        console.error('Error fetching mentor assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyMentees = async (req: any, res: Response): Promise<void> => {
    try {
        const mentorId = req.user.id;
        const mentees = await prisma.mentorAssignment.findMany({
            where: { mentorId }
        });

        if (mentees.length === 0) {
            res.json([]);
            return;
        }

        const studentIds = mentees.map(m => m.studentId);
        const students = await prisma.user.findMany({
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
    } catch (error) {
        console.error('Error fetching mentees:', error);
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
            where: {
                departmentId,
                role: { in: [UserRole.STAFF, UserRole.HOD] }
            }
        });
        
        const deptStudents = await prisma.user.findMany({
            where: { departmentId, role: UserRole.STUDENT }
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
        const studentIds = deptStudents.map((s: any) => s.id);
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
        const allAssignments = await prisma.mentorAssignment.findMany({
            where: { studentId: { in: studentIds } }
        });
        res.json({ message: 'Mentees have been auto-assigned.', assignments: allAssignments });
    } catch (error) {
        console.error('Error auto-assigning mentees:', error);
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

        const [student, mentor] = await Promise.all([
            prisma.user.findUnique({ where: { id: studentId } }),
            prisma.user.findUnique({ where: { id: newMentorId } })
        ]);

        if (!student || student.role !== UserRole.STUDENT) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        if (!mentor || (mentor.role !== UserRole.STAFF && mentor.role !== UserRole.HOD)) {
            res.status(404).json({ message: 'Mentor not found' });
            return;
        }

        if (!student.departmentId || student.departmentId !== mentor.departmentId) {
            res.status(400).json({ message: 'Student and mentor must belong to the same department' });
            return;
        }

        const assignment = await prisma.mentorAssignment.upsert({
            where: { studentId },
            update: { mentorId: newMentorId },
            create: { studentId, mentorId: newMentorId }
        });
        
        res.json(assignment);
    } catch (error) {
        console.error('Error updating mentor assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const bulkUpdateMentorAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentIds, newMentorId } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || !newMentorId) {
            res.status(400).json({ message: 'Missing studentIds array or newMentorId' });
            return;
        }

        const mentor = await prisma.user.findUnique({
            where: { id: newMentorId }
        });

        if (!mentor || (mentor.role !== UserRole.STAFF && mentor.role !== UserRole.HOD)) {
            res.status(404).json({ message: 'Mentor not found' });
            return;
        }

        const students = await prisma.user.findMany({
            where: { id: { in: studentIds } }
        });

        if (students.length !== studentIds.length) {
            res.status(404).json({ message: 'One or more students were not found' });
            return;
        }

        const invalidStudent = students.find(student =>
            student.role !== UserRole.STUDENT ||
            !student.departmentId ||
            student.departmentId !== mentor.departmentId
        );

        if (invalidStudent) {
            res.status(400).json({ message: 'All selected students must belong to the same department as the mentor' });
            return;
        }

        const updates = studentIds.map(studentId => 
            prisma.mentorAssignment.upsert({
                where: { studentId },
                update: { mentorId: newMentorId },
                create: { studentId, mentorId: newMentorId }
            })
        );

        await Promise.all(updates);
        
        res.json({ message: 'Mentors assigned successfully for selected students.' });
    } catch (error) {
        console.error('Error bulk updating mentor assignments:', error);
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
        console.error('Error creating remark:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
