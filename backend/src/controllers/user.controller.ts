import { Request, Response } from 'express';
import { PrismaClient, UserRole, StudentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
        studentProfile: true,
        alumniProfile: true,
      }
    });
    
    const rolePermissions: Record<string, string[]> = {
      'ADMIN': ['users:manage', 'users:view', 'departments:manage', 'departments:view', 'logs:view', 'system:configure', 'alumni:manage', 'reports:generate', 'students:promote', 'MANAGE_USERS', 'MANAGE_DEPARTMENTS'],
      'PRINCIPAL': ['users:view', 'departments:view', 'reports:generate'],
      'HOD': ['users:view', 'students:promote'],
      'STAFF': [],
      'STUDENT': [],
      'EXAM_CELL': ['users:view', 'reports:generate']
    };

    const sanitizedUsers = users.map((u: any) => {
       const { password, studentProfile, alumniProfile, ...user } = u;
       const profileData = studentProfile || alumniProfile || {};
       return {
          ...user,
          ...profileData,
          permissions: user.permissions && user.permissions.length > 0 ? user.permissions : rolePermissions[user.role] || []
       };
    });

    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserPermissions = async (req: Request, res: Response<any>): Promise<void> => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const permissionsArray = Array.isArray(permissions) ? permissions as string[] : [];

    if (!userId) {
       res.status(400).json({ message: 'Valid userId required' });
       return;
    }

    // Using raw SQL to bypass Prisma Client strictly typed cache errors
    await prisma.$executeRaw`UPDATE "User" SET permissions = ${permissionsArray} WHERE id = ${userId}`;
    
    const updatedUser: any = await prisma.$queryRaw`
      UPDATE "User"
      SET permissions = ${permissionsArray}
      WHERE id = ${userId}
      RETURNING *
    `;

    const finalPermissions: string[] = updatedUser?.[0]?.permissions || permissionsArray;
    res.status(200).json({ message: 'Permissions updated successfully', permissions: finalPermissions });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ message: 'Internal server error while linking permissions.' });
  }
};

export const promoteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, year } = req.body;

    if (!departmentId || !year) {
       res.status(400).json({ message: 'departmentId and year required' });
       return;
    }

    // Find all students in that department and year
    const studentsToPromote = await prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        departmentId,
        status: StudentStatus.ACTIVE,
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
             if (!student.studentProfile) continue;
             
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
                 data: { status: StudentStatus.ALUMNI }
             });

             // We keep the student profile or delete it depending on design. Let's delete it so there's no overlap.
             await prisma.studentProfile.delete({
                 where: { userId: student.id }
             });
        }
    } else {
        // Increase Year by 1
        await prisma.studentProfile.updateMany({
             where: {
                  year: Number(year),
                  user: { departmentId: departmentId, status: StudentStatus.ACTIVE }
             },
             data: {
                 year: Number(year) + 1
             }
        });
    }

    res.json({ message: `Successfully ${year === 4 ? 'graduated' : 'promoted'} ${studentsToPromote.length} students` });

  } catch (error) {
    console.error('Error promoting class:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
