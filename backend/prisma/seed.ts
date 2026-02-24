import { PrismaClient, UserRole, StudentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Departments
  const cseDept = await prisma.department.upsert({
    where: { name: 'Computer Science and Engineering' },
    update: {},
    create: { name: 'Computer Science and Engineering' },
  });

  const eceDept = await prisma.department.upsert({
    where: { name: 'Electronics and Communication Engineering' },
    update: {},
    create: { name: 'Electronics and Communication Engineering' },
  });

  // 2. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@nitcampuz.edu' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@nitcampuz.edu',
      password: passwordHash,
      role: UserRole.ADMIN,
      status: StudentStatus.ACTIVE,
    }
  });

  // 3. Create Principal User
  await prisma.user.upsert({
    where: { email: 'principal@nitcampuz.edu' },
    update: {},
    create: {
      name: 'Dr. Principal',
      email: 'principal@nitcampuz.edu',
      password: passwordHash,
      role: UserRole.PRINCIPAL,
      status: StudentStatus.ACTIVE,
    }
  });

  // 4. Create HOD User
  await prisma.user.upsert({
    where: { email: 'hod.cse@nitcampuz.edu' },
    update: {},
    create: {
      name: 'Dr. CSE HOD',
      email: 'hod.cse@nitcampuz.edu',
      password: passwordHash,
      role: UserRole.HOD,
      departmentId: cseDept.id,
      status: StudentStatus.ACTIVE,
    }
  });

  // 5. Create Staff User
  const staff = await prisma.user.upsert({
    where: { email: 'sarah.w@nitcampuz.edu' },
    update: {},
    create: {
      name: 'Prof. Staff Member',
      email: 'sarah.w@nitcampuz.edu',
      password: passwordHash,
      role: UserRole.STAFF,
      departmentId: cseDept.id,
      status: StudentStatus.ACTIVE,
    }
  });

  // 6. Create Student User
  await prisma.user.upsert({
    where: { email: 'alex.j@nitcampuz.edu' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'alex.j@nitcampuz.edu',
      password: passwordHash,
      role: UserRole.STUDENT,
      departmentId: cseDept.id,
      status: StudentStatus.ACTIVE,
      studentProfile: {
        create: {
          regNo: 'REG12346',
          section: 'A',
          admissionYear: 2024,
          year: 2,
          cgpa: 8.5,
        }
      }
    }
  });

  // 7. Create Course
  await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      credits: 3,
      semester: 1,
      staffId: staff.id,
      departmentId: cseDept.id,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
