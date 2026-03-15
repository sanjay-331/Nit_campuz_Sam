"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCourse = exports.getClasses = exports.assignAdvisor = exports.assignHOD = exports.createCourse = exports.createDepartment = exports.createExamSchedule = exports.getAllExamSchedules = exports.createMaterial = exports.getAllMaterials = exports.getAllAttendance = exports.getAllMarks = exports.getAllDepartments = exports.getAllCourses = exports.submitAttendance = exports.publishMarks = exports.verifyMarks = exports.saveMarks = void 0;
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const socket_1 = require("../socket");
const isPrismaKnownError = (error) => {
    return error instanceof client_1.Prisma.PrismaClientKnownRequestError;
};
const calculateGradeAndPoints = (internal, exam) => {
    const total = Math.round(internal + (exam / 2)); // Total out of 100, rounded
    if (total >= 91)
        return { grade: 'O', gradePoint: 10.0 };
    if (total >= 81)
        return { grade: 'A+', gradePoint: 9.0 };
    if (total >= 71)
        return { grade: 'A', gradePoint: 8.0 };
    if (total >= 61)
        return { grade: 'B+', gradePoint: 7.0 };
    if (total >= 51)
        return { grade: 'B', gradePoint: 6.0 };
    if (total >= 50)
        return { grade: 'C', gradePoint: 5.5 };
    if (total >= 45)
        return { grade: 'D', gradePoint: 5.0 };
    return { grade: 'RA', gradePoint: 0.0 };
};
const saveMarks = async (req, res) => {
    try {
        const { courseId, marks } = req.body;
        const userRole = req.user?.role;
        if (!courseId || !marks) {
            res.status(400).json({ message: 'courseId and marks object required' });
            return;
        }
        const course = await db_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        // Determine initial status based on role
        // If staff uploads, it goes to PENDING_EXAM_CELL
        // If Admin/Exam Cell uploads directly, they might want to Skip
        let initialStatus = client_1.MarkStatus.PENDING_EXAM_CELL;
        if (userRole === client_1.UserRole.ADMIN || userRole === client_1.UserRole.EXAM_CELL) {
            initialStatus = client_1.MarkStatus.PENDING_EXAM_CELL;
        }
        for (const [studentId, studentMarks] of Object.entries(marks)) {
            const typedMarks = studentMarks;
            if (typedMarks.internal !== undefined && typedMarks.exam !== undefined) {
                const { grade, gradePoint } = calculateGradeAndPoints(typedMarks.internal, typedMarks.exam);
                // Upsert Marks
                const existingMark = await db_1.prisma.mark.findFirst({
                    where: { courseId, studentId }
                });
                if (existingMark) {
                    await db_1.prisma.mark.update({
                        where: { id: existingMark.id },
                        data: {
                            internal: typedMarks.internal,
                            exam: typedMarks.exam,
                            grade,
                            gradePoint,
                            status: initialStatus
                        }
                    });
                }
                else {
                    await db_1.prisma.mark.create({
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
    }
    catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.saveMarks = saveMarks;
const verifyMarks = async (req, res) => {
    try {
        const { markIds } = req.body;
        const userRole = req.user?.role;
        if (!markIds || !Array.isArray(markIds)) {
            res.status(400).json({ message: 'markIds array required' });
            return;
        }
        let updateData = {};
        let nextStatus;
        if (userRole === client_1.UserRole.EXAM_CELL) {
            updateData.examCellVerified = true;
            nextStatus = client_1.MarkStatus.PENDING_HOD;
        }
        else if (userRole === client_1.UserRole.HOD) {
            updateData.hodVerified = true;
            nextStatus = client_1.MarkStatus.PENDING_PRINCIPAL;
        }
        else if (userRole === client_1.UserRole.PRINCIPAL) {
            updateData.principalVerified = true;
            nextStatus = client_1.MarkStatus.PENDING_PUBLICATION;
        }
        else {
            res.status(403).json({ message: 'Unauthorized role for verification' });
            return;
        }
        if (nextStatus) {
            updateData.status = nextStatus;
        }
        await db_1.prisma.mark.updateMany({
            where: { id: { in: markIds } },
            data: updateData
        });
        res.json({ message: 'Marks verified and moved to next stage' });
    }
    catch (error) {
        console.error('Error verifying marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.verifyMarks = verifyMarks;
const publishMarks = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userRole = req.user?.role;
        if (userRole !== client_1.UserRole.EXAM_CELL && userRole !== client_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only Exam Cell or Admin can publish results' });
            return;
        }
        // Find marks that are PENDING_PUBLICATION
        const marksToPublish = await db_1.prisma.mark.findMany({
            where: {
                courseId,
                status: client_1.MarkStatus.PENDING_PUBLICATION
            }
        });
        if (marksToPublish.length === 0) {
            res.status(400).json({ message: 'No marks ready for publication for this course' });
            return;
        }
        await db_1.prisma.mark.updateMany({
            where: { id: { in: marksToPublish.map(m => m.id) } },
            data: { status: client_1.MarkStatus.PUBLISHED }
        });
        // Recalculate CGPA for students
        const studentIds = [...new Set(marksToPublish.map(m => m.studentId))];
        for (const studentId of studentIds) {
            await recalculateCgpa(studentId);
        }
        // Emit notification
        try {
            const io = (0, socket_1.getIO)();
            io.emit('notification', {
                type: 'Results',
                message: `Results have been published for course ID: ${courseId}`,
                courseId: courseId
            });
        }
        catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }
        res.json({ message: 'Results published successfully' });
    }
    catch (error) {
        console.error('Error publishing marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.publishMarks = publishMarks;
const recalculateCgpa = async (studentId) => {
    const allPublishedMarks = await db_1.prisma.mark.findMany({
        where: { studentId, status: client_1.MarkStatus.PUBLISHED },
        include: { course: true }
    });
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    for (const mark of allPublishedMarks) {
        if (mark.gradePoint !== null && mark.course) {
            totalWeightedPoints += mark.gradePoint * mark.course.credits;
            totalCredits += mark.course.credits;
        }
    }
    const newCgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
    await db_1.prisma.studentProfile.updateMany({
        where: { userId: studentId },
        data: { cgpa: newCgpa }
    });
};
const submitAttendance = async (req, res) => {
    try {
        const { courseId, records } = req.body;
        if (!courseId || !records) {
            res.status(400).json({ message: 'courseId and records object required' });
            return;
        }
        const date = new Date();
        // records is an object: { "student1_id": true, "student2_id": false }
        const attendancePromises = Object.entries(records).map(([studentId, present]) => {
            return db_1.prisma.attendance.create({
                data: {
                    courseId,
                    studentId,
                    date,
                    present: present
                }
            });
        });
        await Promise.all(attendancePromises);
        res.json({ message: 'Attendance submitted successfully' });
    }
    catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.submitAttendance = submitAttendance;
const getAllCourses = async (req, res) => {
    try {
        const courses = await db_1.prisma.course.findMany();
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCourses = getAllCourses;
const getAllDepartments = async (req, res) => {
    try {
        const departments = await db_1.prisma.department.findMany();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllDepartments = getAllDepartments;
const getAllMarks = async (req, res) => {
    try {
        const marks = await db_1.prisma.mark.findMany({
            include: { course: true }
        });
        res.json(marks);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllMarks = getAllMarks;
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await db_1.prisma.attendance.findMany({
            include: { course: true }
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllAttendance = getAllAttendance;
const getAllMaterials = async (req, res) => {
    try {
        const materials = await db_1.prisma.material.findMany({
            include: { course: true }
        });
        res.json(materials);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllMaterials = getAllMaterials;
const createMaterial = async (req, res) => {
    try {
        const { courseId, title, type, url } = req.body;
        if (!courseId || !title || !type || !url) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const newMaterial = await db_1.prisma.material.create({
            data: { courseId, title, type, url }
        });
        // Emit real-time notification
        try {
            const io = (0, socket_1.getIO)();
            io.emit('notification', {
                type: 'Material',
                message: `New study material posted: ${title}`,
                courseId: courseId
            });
        }
        catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }
        res.json(newMaterial);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createMaterial = createMaterial;
const getAllExamSchedules = async (req, res) => {
    try {
        const schedules = await db_1.prisma.examSchedule.findMany();
        res.json(schedules);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllExamSchedules = getAllExamSchedules;
const createExamSchedule = async (req, res) => {
    try {
        const { courseCode, courseName, date, time, duration, hall } = req.body;
        if (!courseCode || !date || !time || !hall) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const newSchedule = await db_1.prisma.examSchedule.create({
            data: { courseCode, courseName, date, time, duration, hall }
        });
        res.json(newSchedule);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createExamSchedule = createExamSchedule;
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Department name is required' });
            return;
        }
        const department = await db_1.prisma.department.create({ data: { name } });
        res.status(201).json(department);
    }
    catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createDepartment = createDepartment;
const createCourse = async (req, res) => {
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
        const department = await db_1.prisma.department.findUnique({
            where: { id: normalizedDepartmentId }
        });
        if (!department) {
            res.status(404).json({ message: 'Department not found' });
            return;
        }
        if (normalizedStaffId) {
            const staffUser = await db_1.prisma.user.findUnique({
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
        const course = await db_1.prisma.course.create({
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
    }
    catch (error) {
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
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCourse = createCourse;
const assignHOD = async (req, res) => {
    try {
        const { deptId, staffId } = req.body;
        // Demote old HOD
        await db_1.prisma.user.updateMany({
            where: { departmentId: deptId, role: client_1.UserRole.HOD },
            data: { role: client_1.UserRole.STAFF }
        });
        // Promote new HOD
        const updatedUser = await db_1.prisma.user.update({
            where: { id: staffId },
            data: { role: client_1.UserRole.HOD }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error assigning HOD:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.assignHOD = assignHOD;
const assignAdvisor = async (req, res) => {
    try {
        const { departmentId, year, advisorId } = req.body;
        const existingClass = await db_1.prisma.class.findFirst({
            where: { departmentId, year: Number(year) }
        });
        let updatedClass;
        if (existingClass) {
            updatedClass = await db_1.prisma.class.update({
                where: { id: existingClass.id },
                data: { advisorId }
            });
        }
        else {
            updatedClass = await db_1.prisma.class.create({
                data: { departmentId, year: Number(year), advisorId }
            });
        }
        res.json(updatedClass);
    }
    catch (error) {
        console.error('Error assigning advisor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.assignAdvisor = assignAdvisor;
const getClasses = async (req, res) => {
    try {
        const classes = await db_1.prisma.class.findMany();
        res.json(classes);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getClasses = getClasses;
const assignCourse = async (req, res) => {
    try {
        const { courseId, staffId } = req.body;
        if (!courseId || !staffId) {
            res.status(400).json({ message: 'Course ID and Staff ID are required' });
            return;
        }
        const [course, staffUser] = await Promise.all([
            db_1.prisma.course.findUnique({ where: { id: courseId } }),
            db_1.prisma.user.findUnique({ where: { id: staffId } })
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
        const updatedCourse = await db_1.prisma.course.update({
            where: { id: courseId },
            data: { staffId }
        });
        res.json(updatedCourse);
    }
    catch (error) {
        console.error('Error assigning course:', error);
        if (isPrismaKnownError(error) && error.code === 'P2025') {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.assignCourse = assignCourse;
