"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const db_1 = require("../db");
const getDashboardAnalytics = async (req, res) => {
    try {
        // 1. Overview Cards Data
        const totalStudents = await db_1.prisma.user.count({ where: { role: 'STUDENT' } });
        const totalStaff = await db_1.prisma.user.count({ where: { role: 'STAFF' } });
        const totalCourses = await db_1.prisma.course.count();
        const totalDepartments = await db_1.prisma.department.count();
        // 2. Attendance Overview (Overall % present across all records)
        const totalAttendanceRecords = await db_1.prisma.attendance.count();
        const presentRecords = await db_1.prisma.attendance.count({ where: { present: true } });
        const attendancePercentage = totalAttendanceRecords > 0
            ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(1)
            : 0;
        // 3. Department Wise Student Distribution
        const studentsPerDeptRaw = await db_1.prisma.user.groupBy({
            by: ['departmentId'],
            where: { role: 'STUDENT', departmentId: { not: null } },
            _count: { id: true }
        });
        // Resolve Department Names
        const departmentIds = studentsPerDeptRaw.map(d => d.departmentId).filter(Boolean);
        const departments = await db_1.prisma.department.findMany({
            where: { id: { in: departmentIds } }
        });
        const studentDistribution = studentsPerDeptRaw.map(d => {
            const dept = departments.find(dep => dep.id === d.departmentId);
            return {
                name: dept?.name || 'Unknown',
                count: d._count.id
            };
        });
        res.json({
            overview: {
                totalStudents,
                totalStaff,
                totalCourses,
                totalDepartments,
                attendancePercentage
            },
            studentDistribution
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
