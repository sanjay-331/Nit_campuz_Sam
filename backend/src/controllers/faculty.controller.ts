import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole, MarkStatus } from '@prisma/client';

export const getFacultyPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId as string;

        const faculty = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                department: true
            }
        });

        if (!faculty || (faculty.role !== UserRole.STAFF && faculty.role !== UserRole.HOD)) {
            res.status(404).json({ message: 'Faculty member not found' });
            return;
        }

        // Get all courses taught by this faculty
        const courses: any[] = await prisma.course.findMany({
            where: { staffId: userId },
            include: {
                marks: {
                    where: { status: MarkStatus.PUBLISHED }
                },
                attendance: true
            }
        });

        const courseMetrics = courses.map((course: any) => {
            const totalMarks = course.marks.length;
            const avgGradePoint = totalMarks > 0 
                ? course.marks.reduce((acc: number, m: any) => acc + (m.gradePoint || 0), 0) / totalMarks 
                : 0;

            const totalAttendanceRecords = course.attendance.length;
            const avgAttendance = totalAttendanceRecords > 0
                ? (course.attendance.filter((a: any) => a.present).length / totalAttendanceRecords) * 100
                : 0;

            return {
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                avgGradePoint,
                avgAttendance,
                studentCount: totalMarks
            };
        });

        const overallAvgGradePoint = courseMetrics.length > 0
            ? courseMetrics.reduce((acc, c) => acc + c.avgGradePoint, 0) / courseMetrics.length
            : 0;

        const overallAvgAttendance = courseMetrics.length > 0
            ? courseMetrics.reduce((acc, c) => acc + c.avgAttendance, 0) / courseMetrics.length
            : 0;

        const performanceScore = (overallAvgGradePoint * 7) + (overallAvgAttendance * 0.3); // Simple weighted score

        res.json({
            facultyId: faculty.id,
            facultyName: faculty.name,
            department: (faculty as any).department?.name,
            courseMetrics,
            overallAvgGradePoint,
            overallAvgAttendance,
            performanceScore: Math.min(100, Math.round(performanceScore * 10) / 10)
        });

    } catch (error) {
        console.error('Error fetching faculty performance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllFacultyPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const staffMembers = await prisma.user.findMany({
            where: {
                role: { in: [UserRole.STAFF, UserRole.HOD] }
            }
        });

        const performances = await Promise.all(staffMembers.map(async (staff) => {
            const courses = await prisma.course.findMany({
                where: { staffId: staff.id },
                include: {
                    marks: { where: { status: MarkStatus.PUBLISHED } },
                    attendance: true
                }
            });

            if (courses.length === 0) return { facultyId: staff.id, facultyName: staff.name, performanceScore: 0 };

            let totalGP = 0;
            let totalAtt = 0;
            let courseCount = 0;

            for (const course of courses) {
                const totalMarks = course.marks.length;
                const avgGP = totalMarks > 0 ? course.marks.reduce((acc, m) => acc + (m.gradePoint || 0), 0) / totalMarks : 0;
                
                const totalAttRec = course.attendance.length;
                const avgAtt = totalAttRec > 0 ? (course.attendance.filter(a => a.present).length / totalAttRec) * 100 : 0;

                totalGP += avgGP;
                totalAtt += avgAtt;
                courseCount++;
            }

            const performanceScore = ( (totalGP / courseCount) * 7) + ((totalAtt / courseCount) * 0.3);
            return {
                facultyId: staff.id,
                facultyName: staff.name,
                performanceScore: Math.min(100, Math.round(performanceScore * 10) / 10)
            };
        }));

        res.json(performances);
    } catch (error) {
        console.error('Error fetching overall faculty performance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
