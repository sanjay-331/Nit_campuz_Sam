
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const staff = await prisma.user.findUnique({ where: { email: 'sarah.w@nitcampuz.edu' } });
  const student = await prisma.user.findUnique({ where: { email: 'alex.j@nitcampuz.edu' } });

  if (staff && student) {
    await prisma.mentorAssignment.upsert({
      where: { studentId: student.id },
      update: { mentorId: staff.id },
      create: { studentId: student.id, mentorId: staff.id }
    });
    console.log(`Assigned student ${student.email} to mentor ${staff.email}`);
  } else {
    console.log('Staff or Student not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
