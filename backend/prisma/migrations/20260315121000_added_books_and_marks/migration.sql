-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('PENDING_EXAM_CELL', 'PENDING_HOD', 'PENDING_PRINCIPAL', 'PENDING_PUBLICATION', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Mark" 
ADD COLUMN "status" "MarkStatus" NOT NULL DEFAULT 'PENDING_EXAM_CELL',
ADD COLUMN "examCellVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "hodVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "principalVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "bookUrl" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
