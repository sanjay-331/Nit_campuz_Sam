"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExamSchedule = exports.getAllExamSchedules = exports.createMaterial = exports.getAllMaterials = exports.getAllAttendance = exports.getAllMarks = exports.getAllDepartments = exports.getAllCourses = exports.submitAttendance = exports.saveMarks = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const calculateGradeAndPoints = (internal, exam) => {
    const total = internal + (exam / 2); // Total out of 100
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
        return { grade: 'C', gradePoint: 5.0 };
    return { grade: 'RA', gradePoint: 0.0 };
};
const saveMarks = async (req, res) => {
    try {
        const { courseId, marks } = req.body;
        if (!courseId || !marks) {
            res.status(400).json({ message: 'courseId and marks object required' });
            return;
        }
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        // Process each student's marks
        // marks is an object like: { "student1_id": { internal: 40, exam: 80 } }
        const updatedStudentIds = new Set();
        for (const [studentId, studentMarks] of Object.entries(marks)) {
            const typedMarks = studentMarks;
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
                            gradePoint
                        }
                    });
                }
                else {
                    await prisma.mark.create({
                        data: {
                            courseId,
                            studentId,
                            semester: course.semester,
                            internal: typedMarks.internal,
                            exam: typedMarks.exam,
                            grade,
                            gradePoint
                        }
                    });
                }
                updatedStudentIds.add(studentId);
            }
        }
        // Recalculate CGPA for all updated students
        for (const studentId of Array.from(updatedStudentIds)) {
            const allMarks = await prisma.mark.findMany({
                where: { studentId },
                include: { course: true }
            });
            let totalWeightedPoints = 0;
            let totalCredits = 0;
            for (const mark of allMarks) {
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
        }
        res.json({ message: 'Marks updated successfully' });
    }
    catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.saveMarks = saveMarks;
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
            return prisma.attendance.create({
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
        const courses = await prisma.course.findMany();
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCourses = getAllCourses;
const getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllDepartments = getAllDepartments;
const getAllMarks = async (req, res) => {
    try {
        const marks = await prisma.mark.findMany({
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
        const attendance = await prisma.attendance.findMany({
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
        const materials = await prisma.material.findMany({
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
        const newMaterial = await prisma.material.create({
            data: { courseId, title, type, url }
        });
        res.json(newMaterial);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createMaterial = createMaterial;
const getAllExamSchedules = async (req, res) => {
    try {
        const schedules = await prisma.examSchedule.findMany();
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
        const newSchedule = await prisma.examSchedule.create({
            data: { courseCode, courseName, date, time, duration, hall }
        });
        res.json(newSchedule);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createExamSchedule = createExamSchedule;
