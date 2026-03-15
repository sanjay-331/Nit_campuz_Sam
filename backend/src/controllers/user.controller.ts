import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole, StudentStatus, User } from '@prisma/client';
import bcrypt from 'bcrypt';

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
       const rawProfileData = studentProfile || alumniProfile || {};
       const { id: profileId, userId: profileUserId, ...profileData } = rawProfileData;
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

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, departmentId, status, password, ...profileData } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedDepartmentId = typeof departmentId === 'string' ? departmentId.trim() : '';

    if (!normalizedName || !normalizedEmail) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      res.status(400).json({ message: 'A valid email address is required' });
      return;
    }

    const prismaRole = (role as string || UserRole.STUDENT).toUpperCase() as UserRole;
    const prismaStatus = (status as string || 'ACTIVE').toUpperCase() as StudentStatus;

    if (!normalizedDepartmentId) {
      res.status(400).json({ message: 'Department is required' });
      return;
    }

    const department = await prisma.department.findUnique({
      where: { id: normalizedDepartmentId }
    });

    if (!department) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    if (prismaRole === UserRole.STUDENT) {
      const regNo = String(profileData.regNo || '').trim();
      const section = String(profileData.section || '').trim();
      const year = Number(profileData.year);

      if (!regNo || !section || !Number.isInteger(year) || year < 1) {
        res.status(400).json({ message: 'Student regNo, year, and section are required' });
        return;
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const newUser = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: prismaRole,
        departmentId: normalizedDepartmentId,
        status: prismaStatus,
        permissions: [] 
      }
    });

    if (prismaRole === UserRole.STUDENT) {
       await prisma.studentProfile.create({
         data: {
           userId: newUser.id,
           regNo: String(profileData.regNo).trim(),
           section: String(profileData.section).trim(),
           admissionYear: Number(profileData.admissionYear) || new Date().getFullYear(),
           year: Number(profileData.year),
           cgpa: 0.0
         }
       });
       
       // Also create Dues record
       await prisma.dues.create({
          data: {
            studentId: newUser.id,
            library: false,
            department: false,
            accounts: false
          }
       });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const bulkCreateUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersData = req.body;
    if (!Array.isArray(usersData)) {
      res.status(400).json({ message: 'Invalid data format' });
      return;
    }

    const createdUsers = [];
    const defaultPassword = await bcrypt.hash('password123', 10);

    for (const data of usersData) {
      const { name, email, role, departmentId, status, ...profileData } = data;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) continue;

      const prismaRole = (role as string || UserRole.STUDENT).toUpperCase() as UserRole;
      const prismaStatus = (status as string || 'ACTIVE').toUpperCase() as StudentStatus;

      const newUser = await prisma.user.create({
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

      if (prismaRole === UserRole.STUDENT) {
        await prisma.studentProfile.create({
          data: {
            userId: newUser.id,
            regNo: profileData.regNo,
            section: profileData.section || 'A',
            admissionYear: Number(profileData.admissionYear) || new Date().getFullYear(),
            year: Number(profileData.year) || 1,
            cgpa: 0.0
          }
        });
        
        await prisma.dues.create({
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
  } catch (error) {
    console.error('Error bulk creating users:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { name, email, role, departmentId, status, regNo, year, section } = req.body;

    const prismaRole = role ? (role as string).toUpperCase() as UserRole : undefined;
    const prismaStatus = status ? (status as string).toUpperCase() as StudentStatus : undefined;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: prismaRole,
        departmentId: departmentId && departmentId !== '' ? departmentId : (departmentId === '' ? null : undefined),
        status: prismaStatus
      }
    });

    if (prismaRole === UserRole.STUDENT || (updatedUser.role === UserRole.STUDENT)) {
        await prisma.studentProfile.upsert({
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
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        
        // Delete related profiles first
        await prisma.studentProfile.deleteMany({ where: { userId: id } });
        await prisma.alumniProfile.deleteMany({ where: { userId: id } });
        await prisma.dues.deleteMany({ where: { studentId: id } });
        await prisma.noDuesCertificate.deleteMany({ where: { studentId: id } });
        
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUsersStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, status } = req.body;

    const prismaStatus = (status as string || 'ACTIVE').toUpperCase() as StudentStatus;

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status: prismaStatus }
    });

    res.json({ message: 'Users status updated successfully' });
  } catch (error) {
    console.error('Error updating users status:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const transferStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentIds, newDepartmentId } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0 || !newDepartmentId) {
            res.status(400).json({ message: 'studentIds and newDepartmentId are required' });
            return;
        }

        await prisma.user.updateMany({
            where: { id: { in: studentIds } },
            data: { departmentId: newDepartmentId }
        });

        await prisma.studentProfile.updateMany({
            where: {
                userId: { in: studentIds },
                year: 1,
            },
            data: { year: 2 }
        });

        res.json({ message: `Successfully transferred ${studentIds.length} students to their new department and promoted them to 2nd year` });
    } catch (error) {
        console.error('Error transferring students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const bulkPromoteStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds } = req.body;
        
        const students = await prisma.user.findMany({
            where: { id: { in: userIds }, role: UserRole.STUDENT },
            include: { studentProfile: true }
        });

        for (const student of students) {
            if (!student.studentProfile) continue;

            if (student.studentProfile.year < 4) {
                await prisma.studentProfile.update({
                    where: { id: student.studentProfile.id },
                    data: { year: student.studentProfile.year + 1 }
                });
            } else {
                // Graduate
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

                await prisma.user.update({
                    where: { id: student.id },
                    data: { status: StudentStatus.ALUMNI }
                });

                await prisma.studentProfile.delete({
                    where: { id: student.studentProfile.id }
                });
            }
        }

        res.json({ message: `Successfully promoted ${students.length} students` });
    } catch (error) {
        console.error('Error promoting students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
