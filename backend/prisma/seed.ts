import { PrismaClient, UserRole, StudentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Use the adapter-pg pattern as required by your project's prisma version
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
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

  console.log('Department created.');

  // 2. Create Admin User
  const adminEmail = 'admin@nitcampuz.edu';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        password: passwordHash,
        role: UserRole.ADMIN,
        status: StudentStatus.ACTIVE,
        permissions: [],
      }
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // 3. Create Principal User
  const principalEmail = 'principal@nitcampuz.edu';
  const existingPrincipal = await prisma.user.findUnique({ where: { email: principalEmail } });
  if (!existingPrincipal) {
    await prisma.user.create({
      data: {
        name: 'Dr. Principal',
        email: principalEmail,
        password: passwordHash,
        role: UserRole.PRINCIPAL,
        status: StudentStatus.ACTIVE,
        permissions: [],
      }
    });
  }

  // 4. Create Student User
  const studentEmail = 'alex.j@nitcampuz.edu';
  const existingStudent = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        name: 'Test Student',
        email: studentEmail,
        password: passwordHash,
        role: UserRole.STUDENT,
        departmentId: cseDept.id,
        status: StudentStatus.ACTIVE,
        permissions: [],
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
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
