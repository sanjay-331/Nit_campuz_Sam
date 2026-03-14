"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkPromoteStudents = exports.transferStudents = exports.updateUsersStatus = exports.removeUser = exports.updateUser = exports.bulkCreateUsers = exports.createUser = exports.promoteClass = exports.updateUserPermissions = exports.getAllUsers = void 0;
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllUsers = async (req, res) => {
    try {
        const users = await db_1.prisma.user.findMany({
            include: {
                department: true,
                studentProfile: true,
                alumniProfile: true,
            }
        });
        const rolePermissions = {
            'ADMIN': ['users:manage', 'users:view', 'departments:manage', 'departments:view', 'logs:view', 'system:configure', 'alumni:manage', 'reports:generate', 'students:promote', 'MANAGE_USERS', 'MANAGE_DEPARTMENTS'],
            'PRINCIPAL': ['users:view', 'departments:view', 'reports:generate'],
            'HOD': ['users:view', 'students:promote'],
            'STAFF': [],
            'STUDENT': [],
            'EXAM_CELL': ['users:view', 'reports:generate']
        };
        const sanitizedUsers = users.map((u) => {
            const { password, studentProfile, alumniProfile, ...user } = u;
            const profileData = studentProfile || alumniProfile || {};
            return {
                ...user,
                ...profileData,
                permissions: user.permissions && user.permissions.length > 0 ? user.permissions : rolePermissions[user.role] || []
            };
        });
        res.status(200).json(sanitizedUsers);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { permissions } = req.body;
        const permissionsArray = Array.isArray(permissions) ? permissions : [];
        if (!userId) {
            res.status(400).json({ message: 'Valid userId required' });
            return;
        }
        // Using raw SQL to bypass Prisma Client strictly typed cache errors
        await db_1.prisma.$executeRaw `UPDATE "User" SET permissions = ${permissionsArray} WHERE id = ${userId}`;
        const updatedUser = await db_1.prisma.$queryRaw `
      UPDATE "User"
      SET permissions = ${permissionsArray}
      WHERE id = ${userId}
      RETURNING *
    `;
        const finalPermissions = updatedUser?.[0]?.permissions || permissionsArray;
        res.status(200).json({ message: 'Permissions updated successfully', permissions: finalPermissions });
    }
    catch (error) {
        console.error('Error updating user permissions:', error);
        res.status(500).json({ message: 'Internal server error while linking permissions.' });
    }
};
exports.updateUserPermissions = updateUserPermissions;
const promoteClass = async (req, res) => {
    try {
        const { departmentId, year } = req.body;
        if (!departmentId || !year) {
            res.status(400).json({ message: 'departmentId and year required' });
            return;
        }
        // Find all students in that department and year
        const studentsToPromote = await db_1.prisma.user.findMany({
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
                await db_1.prisma.alumniProfile.create({
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
                await db_1.prisma.user.update({
                    where: { id: student.id },
                    data: { status: client_1.StudentStatus.ALUMNI }
                });
                // We keep the student profile or delete it depending on design. Let's delete it so there's no overlap.
                await db_1.prisma.studentProfile.delete({
                    where: { userId: student.id }
                });
            }
        }
        else {
            // Increase Year by 1
            await db_1.prisma.studentProfile.updateMany({
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
const createUser = async (req, res) => {
    try {
        const { name, email, role, departmentId, status, password, ...profileData } = req.body;
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password || 'password123', 10);
        // Normalize role and status for Prisma enums (usually uppercase)
        const prismaRole = (role || client_1.UserRole.STUDENT).toUpperCase();
        const prismaStatus = (status || 'ACTIVE').toUpperCase();
        const newUser = await db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: prismaRole,
                departmentId: departmentId && departmentId !== '' ? departmentId : null,
                status: prismaStatus,
                permissions: []
            }
        });
        if (prismaRole === client_1.UserRole.STUDENT) {
            await db_1.prisma.studentProfile.create({
                data: {
                    userId: newUser.id,
                    regNo: profileData.regNo || `REG-${newUser.id.substring(0, 8)}`,
                    section: profileData.section || 'A',
                    admissionYear: Number(profileData.admissionYear) || new Date().getFullYear(),
                    year: Number(profileData.year) || 1,
                    cgpa: 0.0
                }
            });
            // Also create Dues record
            await db_1.prisma.dues.create({
                data: {
                    studentId: newUser.id,
                    library: false,
                    department: false,
                    accounts: false
                }
            });
        }
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createUser = createUser;
const bulkCreateUsers = async (req, res) => {
    try {
        const usersData = req.body;
        if (!Array.isArray(usersData)) {
            res.status(400).json({ message: 'Invalid data format' });
            return;
        }
        const createdUsers = [];
        const defaultPassword = await bcrypt_1.default.hash('password123', 10);
        for (const data of usersData) {
            const { name, email, role, departmentId, status, ...profileData } = data;
            const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
            if (existingUser)
                continue;
            const prismaRole = (role || client_1.UserRole.STUDENT).toUpperCase();
            const prismaStatus = (status || 'ACTIVE').toUpperCase();
            const newUser = await db_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: defaultPassword,
                    role: prismaRole,
                    departmentId: departmentId && departmentId !== '' ? departmentId : null,
                    status: prismaStatus,
                    permissions: []
                }
            });
            if (prismaRole === client_1.UserRole.STUDENT) {
                await db_1.prisma.studentProfile.create({
                    data: {
                        userId: newUser.id,
                        regNo: profileData.regNo,
                        section: profileData.section || 'A',
                        admissionYear: Number(profileData.admissionYear) || new Date().getFullYear(),
                        year: Number(profileData.year) || 1,
                        cgpa: 0.0
                    }
                });
                await db_1.prisma.dues.create({
                    data: {
                        studentId: newUser.id,
                        library: false,
                        department: false,
                        accounts: false
                    }
                });
            }
            createdUsers.push(newUser);
        }
        res.status(201).json({ message: `${createdUsers.length} users created successfully`, count: createdUsers.length });
    }
    catch (error) {
        console.error('Error bulk creating users:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.bulkCreateUsers = bulkCreateUsers;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, departmentId, status, regNo, year, section } = req.body;
        const prismaRole = role ? role.toUpperCase() : undefined;
        const prismaStatus = status ? status.toUpperCase() : undefined;
        const updatedUser = await db_1.prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role: prismaRole,
                departmentId: departmentId && departmentId !== '' ? departmentId : (departmentId === '' ? null : undefined),
                status: prismaStatus
            }
        });
        if (prismaRole === client_1.UserRole.STUDENT || (updatedUser.role === client_1.UserRole.STUDENT)) {
            await db_1.prisma.studentProfile.upsert({
                where: { userId: id },
                update: {
                    regNo: regNo,
                    year: year ? Number(year) : undefined,
                    section: section
                },
                create: {
                    userId: id,
                    regNo: regNo || `REG-${id.substring(0, 8)}`,
                    year: year ? Number(year) : 1,
                    section: section || 'A',
                    admissionYear: new Date().getFullYear()
                }
            });
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateUser = updateUser;
const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete related profiles first
        await db_1.prisma.studentProfile.deleteMany({ where: { userId: id } });
        await db_1.prisma.alumniProfile.deleteMany({ where: { userId: id } });
        await db_1.prisma.dues.deleteMany({ where: { studentId: id } });
        await db_1.prisma.noDuesCertificate.deleteMany({ where: { studentId: id } });
        await db_1.prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.removeUser = removeUser;
const updateUsersStatus = async (req, res) => {
    try {
        const { userIds, status } = req.body;
        const prismaStatus = (status || 'ACTIVE').toUpperCase();
        await db_1.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { status: prismaStatus }
        });
        res.json({ message: 'Users status updated successfully' });
    }
    catch (error) {
        console.error('Error updating users status:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateUsersStatus = updateUsersStatus;
const transferStudents = async (req, res) => {
    try {
        const { studentIds, newDepartmentId } = req.body;
        await db_1.prisma.user.updateMany({
            where: { id: { in: studentIds } },
            data: { departmentId: newDepartmentId }
        });
        res.json({ message: `Successfully transferred ${studentIds.length} students` });
    }
    catch (error) {
        console.error('Error transferring students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.transferStudents = transferStudents;
const bulkPromoteStudents = async (req, res) => {
    try {
        const { userIds } = req.body;
        const students = await db_1.prisma.user.findMany({
            where: { id: { in: userIds }, role: client_1.UserRole.STUDENT },
            include: { studentProfile: true }
        });
        for (const student of students) {
            if (!student.studentProfile)
                continue;
            if (student.studentProfile.year < 4) {
                await db_1.prisma.studentProfile.update({
                    where: { id: student.studentProfile.id },
                    data: { year: student.studentProfile.year + 1 }
                });
            }
            else {
                // Graduate
                await db_1.prisma.alumniProfile.create({
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
                await db_1.prisma.user.update({
                    where: { id: student.id },
                    data: { status: client_1.StudentStatus.ALUMNI }
                });
                await db_1.prisma.studentProfile.delete({
                    where: { id: student.studentProfile.id }
                });
            }
        }
        res.json({ message: `Successfully promoted ${students.length} students` });
    }
    catch (error) {
        console.error('Error promoting students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bulkPromoteStudents = bulkPromoteStudents;
