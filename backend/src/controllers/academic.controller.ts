import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole, MarkStatus, Prisma } from '@prisma/client';
import { getIO } from '../socket';

const isPrismaKnownError = (error: unknown): error is Prisma.PrismaClientKnownRequestError => {
    return error instanceof Prisma.PrismaClientKnownRequestError;
};

const isNotNullConstraintError = (error: unknown, columnName: string): boolean => {
    const message = error instanceof Error ? error.message : '';
    return message.includes(`null value in column "${columnName}"`) && message.includes('violates not-null constraint');
};

const calculateGradeAndPoints = (internal: number, exam: number): { grade: string, gradePoint: number } => {
    const total = Math.round(internal + (exam / 2)); // Total out of 100, rounded
    if (total >= 91) return { grade: 'O', gradePoint: 10.0 };
    if (total >= 81) return { grade: 'A+', gradePoint: 9.0 };
    if (total >= 71) return { grade: 'A', gradePoint: 8.0 };
    if (total >= 61) return { grade: 'B+', gradePoint: 7.0 };
    if (total >= 51) return { grade: 'B', gradePoint: 6.0 };
    if (total >= 50) return { grade: 'C', gradePoint: 5.5 };
    if (total >= 45) return { grade: 'D', gradePoint: 5.0 };
    return { grade: 'RA', gradePoint: 0.0 };
};

export const saveMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, marks } = req.body;
    const userRole = (req as any).user?.role;
    
    if (!courseId || !marks) {
      res.status(400).json({ message: 'courseId and marks object required' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Determine initial status based on role
    // If staff uploads, it goes to PENDING_EXAM_CELL
    // If Admin/Exam Cell uploads directly, they might want to Skip
    let initialStatus: MarkStatus = MarkStatus.PENDING_EXAM_CELL;
    if (userRole === UserRole.ADMIN || userRole === UserRole.EXAM_CELL) {
        initialStatus = MarkStatus.PENDING_EXAM_CELL; 
    }

    for (const [studentId, studentMarks] of Object.entries(marks)) {
      const typedMarks = studentMarks as { internal?: number, exam?: number };
      
      if (typedMarks.internal !== undefined && typedMarks.exam !== undefined) {
        const { grade, gradePoint } = calculateGradeAndPoints(typedMarks.internal, typedMarks.exam);
        
        // Upsert Marks
        const existingMark = await prisma.mark.findFirst({
            where: { courseId, studentId }
        });

        if (existingMark) {
            await prisma.mark.update({
                where: { id: existingMark.id },
                data: {
                    internal: typedMarks.internal,
                    exam: typedMarks.exam,
                    grade,
                    gradePoint,
                    status: initialStatus
                }
            });
        } else {
            await prisma.mark.create({
                data: {
                    courseId,
                    studentId,
                    semester: course.semester,
                    internal: typedMarks.internal,
                    exam: typedMarks.exam,
                    grade,
                    gradePoint,
                    status: initialStatus
                }
            });
        }
      }
    }

    res.json({ message: 'Marks saved successfully and pending verification' });

  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { markIds } = req.body;
        const userRole = (req as any).user?.role;

        if (!markIds || !Array.isArray(markIds)) {
            res.status(400).json({ message: 'markIds array required' });
            return;
        }

        let updateData: any = {};
        let nextStatus: MarkStatus | undefined;

        if (userRole === UserRole.EXAM_CELL) {
            updateData.examCellVerified = true;
            nextStatus = MarkStatus.PENDING_HOD;
        } else if (userRole === UserRole.HOD) {
            updateData.hodVerified = true;
            nextStatus = MarkStatus.PENDING_PRINCIPAL;
        } else if (userRole === UserRole.PRINCIPAL) {
            updateData.principalVerified = true;
            nextStatus = MarkStatus.PENDING_PUBLICATION;
        } else {
            res.status(403).json({ message: 'Unauthorized role for verification' });
            return;
        }

        if (nextStatus) {
            updateData.status = nextStatus;
        }

        await prisma.mark.updateMany({
            where: { id: { in: markIds } },
            data: updateData
        });

        res.json({ message: 'Marks verified and moved to next stage' });
    } catch (error) {
        console.error('Error verifying marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const publishMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.body;
        const userRole = (req as any).user?.role;

        if (userRole !== UserRole.EXAM_CELL && userRole !== UserRole.ADMIN) {
            res.status(403).json({ message: 'Only Exam Cell or Admin can publish results' });
            return;
        }

        // Find marks that are PENDING_PUBLICATION
        const marksToPublish = await prisma.mark.findMany({
            where: { 
                courseId, 
                status: MarkStatus.PENDING_PUBLICATION 
            }
        });

        if (marksToPublish.length === 0) {
            res.status(400).json({ message: 'No marks ready for publication for this course' });
            return;
        }

        await prisma.mark.updateMany({
            where: { id: { in: marksToPublish.map(m => m.id) } },
            data: { status: MarkStatus.PUBLISHED }
        });

        // Recalculate CGPA for students
        const studentIds = [...new Set(marksToPublish.map(m => m.studentId))];
        for (const studentId of studentIds) {
            await recalculateCgpa(studentId);
        }

        // Emit notification
        try {
            const io = getIO();
            io.emit('notification', {
                type: 'Results',
                message: `Results have been published for course ID: ${courseId}`,
                courseId: courseId
            });
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

        res.json({ message: 'Results published successfully' });
    } catch (error) {
        console.error('Error publishing marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const recalculateCgpa = async (studentId: string) => {
    const allPublishedMarks = await prisma.mark.findMany({
        where: { studentId, status: MarkStatus.PUBLISHED },
        include: { course: true }
    });

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const mark of allPublishedMarks as any[]) {
        if (mark.gradePoint !== null && mark.course) {
             totalWeightedPoints += mark.gradePoint * mark.course.credits;
             totalCredits += mark.course.credits;
        }
    }

    const newCgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
    
    await prisma.studentProfile.updateMany({
        where: { userId: studentId },
        data: { cgpa: newCgpa }
    });
};

export const submitAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, records } = req.body;

    if (!courseId || !records) {
      res.status(400).json({ message: 'courseId and records object required' });
      return;
    }

    const date = new Date();
    
    // records is an object: { "student1_id": true, "student2_id": false }
    const attendancePromises = Object.entries(records).map(([studentId, present]) => {
        return prisma.attendance.create({
            data: {
                courseId,
                studentId,
                date,
                present: present as boolean
            }
        });
    });

    await Promise.all(attendancePromises);

    res.json({ message: 'Attendance submitted successfully' });

  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
        const courses = await prisma.course.findMany();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
        const departments = await prisma.department.findMany();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        const marks = await prisma.mark.findMany({
            include: { course: true }
        });
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const attendance = await prisma.attendance.findMany({
             include: { course: true }
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllMaterials = async (req: Request, res: Response): Promise<void> => {
    try {
        const materials = await prisma.material.findMany({
            include: { course: true }
        });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createMaterial = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId, title, type, url } = req.body;
        
        if (!courseId || !title || !type || !url) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const newMaterial = await prisma.material.create({
            data: { courseId, title, type, url }
        });

        // Emit real-time notification
        try {
            const io = getIO();
            io.emit('notification', {
                type: 'Material',
                message: `New study material posted: ${title}`,
                courseId: courseId
            });
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

        res.json(newMaterial);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllExamSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const schedules = await prisma.examSchedule.findMany();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createExamSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseCode, courseName, date, time, duration, hall } = req.body;
        
        if (!courseCode || !date || !time || !hall) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const newSchedule = await prisma.examSchedule.create({
            data: { courseCode, courseName, date, time, duration, hall }
        });
        res.json(newSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Department name is required' });
            return;
        }
        const department = await prisma.department.create({ data: { name } });
        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, code, staffId, departmentId, credits, semester } = req.body;
        const normalizedName = String(name ?? '').trim();
        const normalizedCode = String(code ?? '').trim().toUpperCase();
        const normalizedDepartmentId = String(departmentId ?? '').trim();
        const normalizedStaffId = typeof staffId === 'string' && staffId.trim() ? staffId.trim() : null;
        const parsedCredits = Number(credits);
        const parsedSemester = Number(semester);

        if (!normalizedName || !normalizedCode || !normalizedDepartmentId) {
            res.status(400).json({ message: 'Course name, code, and department are required' });
            return;
        }

        if (!Number.isInteger(parsedCredits) || parsedCredits < 1) {
            res.status(400).json({ message: 'Credits must be a positive whole number' });
            return;
        }

        if (!Number.isInteger(parsedSemester) || parsedSemester < 1) {
            res.status(400).json({ message: 'Semester must be a positive whole number' });
            return;
        }

        const department = await prisma.department.findUnique({
            where: { id: normalizedDepartmentId }
        });

        if (!department) {
            res.status(404).json({ message: 'Department not found' });
            return;
        }

        if (normalizedStaffId) {
            const staffUser = await prisma.user.findUnique({
                where: { id: normalizedStaffId }
            });

            if (!staffUser) {
                res.status(404).json({ message: 'Staff member not found' });
                return;
            }

            if (staffUser.departmentId !== normalizedDepartmentId) {
                res.status(400).json({ message: 'Staff member must belong to the same department' });
                return;
            }
        }

        const course = await prisma.course.create({
            data: { 
                name: normalizedName,
                code: normalizedCode,
                staffId: normalizedStaffId,
                departmentId: normalizedDepartmentId,
                credits: parsedCredits,
                semester: parsedSemester
            }
        });
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        if (isPrismaKnownError(error)) {
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'A course with this code already exists' });
                return;
            }

            if (error.code === 'P2003') {
                res.status(400).json({ message: 'Invalid course relationship data' });
                return;
            }
        }

        const requestedStaffId = typeof req.body?.staffId === 'string' && req.body.staffId.trim() ? req.body.staffId.trim() : null;
        if (requestedStaffId === null && isNotNullConstraintError(error, 'staffId')) {
            res.status(500).json({ message: 'Database schema is outdated. Apply the latest Prisma migrations on the server and try again.' });
            return;
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const assignHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { deptId, staffId } = req.body;
        
        // Demote old HOD
        await prisma.user.updateMany({
            where: { departmentId: deptId, role: UserRole.HOD },
            data: { role: UserRole.STAFF }
        });

        // Promote new HOD
        const updatedUser = await prisma.user.update({
            where: { id: staffId },
            data: { role: UserRole.HOD }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error assigning HOD:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const assignAdvisor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { departmentId, year, advisorId } = req.body;
        
        const existingClass = await prisma.class.findFirst({
            where: { departmentId, year: Number(year) }
        });

        let updatedClass;
        if (existingClass) {
            updatedClass = await prisma.class.update({
                where: { id: existingClass.id },
                data: { advisorId }
            });
        } else {
            updatedClass = await prisma.class.create({
                data: { departmentId, year: Number(year), advisorId }
            });
        }

        res.json(updatedClass);
    } catch (error) {
        console.error('Error assigning advisor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getClasses = async (req: Request, res: Response): Promise<void> => {
    try {
        const classes = await prisma.class.findMany();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const assignCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId, staffId } = req.body;
        
        if (!courseId || !staffId) {
            res.status(400).json({ message: 'Course ID and Staff ID are required' });
            return;
        }

        const [course, staffUser] = await Promise.all([
            prisma.course.findUnique({ where: { id: courseId } }),
            prisma.user.findUnique({ where: { id: staffId } })
        ]);

        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        if (!staffUser) {
            res.status(404).json({ message: 'Staff member not found' });
            return;
        }

        if (staffUser.departmentId !== course.departmentId) {
            res.status(400).json({ message: 'Staff member must belong to the same department as the course' });
            return;
        }

        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: { staffId }
        });

        res.json(updatedCourse);
    } catch (error) {
        console.error('Error assigning course:', error);
        if (isPrismaKnownError(error) && error.code === 'P2025') {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
