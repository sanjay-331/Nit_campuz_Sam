"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteClass = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                department: true,
                studentProfile: true,
                alumniProfile: true,
            }
        });
        // In a real app we would map this to match exactly what the frontend store expects
        // but Prisma include already provides most of the required nested data.
        const sanitizedUsers = users.map(({ password, ...user }) => user);
        res.json(sanitizedUsers);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const promoteClass = async (req, res) => {
    try {
        const { departmentId, year } = req.body;
        if (!departmentId || !year) {
            res.status(400).json({ message: 'departmentId and year required' });
            return;
        }
        // Find all students in that department and year
        const studentsToPromote = await prisma.user.findMany({
            where: {
                role: client_1.UserRole.STUDENT,
                departmentId,
                status: client_1.StudentStatus.ACTIVE,
                studentProfile: {
                    year: Number(year),
                }
            },
            include: {
                studentProfile: true
            }
        });
        if (studentsToPromote.length === 0) {
            res.status(404).json({ message: 'No students found to promote.' });
            return;
        }
        if (Number(year) === 4) {
            // Graduate
            for (const student of studentsToPromote) {
                if (!student.studentProfile)
                    continue;
                // Create Alumni Profile
                await prisma.alumniProfile.create({
                    data: {
                        userId: student.id,
                        regNo: student.studentProfile.regNo,
                        section: student.studentProfile.section,
                        admissionYear: student.studentProfile.admissionYear,
                        year: 4,
                        cgpa: student.studentProfile.cgpa,
                        graduationYear: new Date().getFullYear(),
                        finalCgpa: student.studentProfile.cgpa
                    }
                });
                // Update user status
                await prisma.user.update({
                    where: { id: student.id },
                    data: { status: client_1.StudentStatus.ALUMNI }
                });
                // We keep the student profile or delete it depending on design. Let's delete it so there's no overlap.
                await prisma.studentProfile.delete({
                    where: { userId: student.id }
                });
            }
        }
        else {
            // Increase Year by 1
            await prisma.studentProfile.updateMany({
                where: {
                    year: Number(year),
                    user: { departmentId: departmentId, status: client_1.StudentStatus.ACTIVE }
                },
                data: {
                    year: Number(year) + 1
                }
            });
        }
        res.json({ message: `Successfully ${year === 4 ? 'graduated' : 'promoted'} ${studentsToPromote.length} students` });
    }
    catch (error) {
        console.error('Error promoting class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.promoteClass = promoteClass;
