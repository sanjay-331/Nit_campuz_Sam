-- AlterTable
ALTER TABLE "User" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "NoDuesCertificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Requested',
    "issuedAt" TIMESTAMP(3),

    CONSTRAINT "NoDuesCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dues" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "library" BOOLEAN NOT NULL DEFAULT false,
    "department" BOOLEAN NOT NULL DEFAULT false,
    "accounts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dues_studentId_key" ON "Dues"("studentId");
