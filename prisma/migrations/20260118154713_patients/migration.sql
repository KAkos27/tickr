/*
  Warnings:

  - You are about to drop the `UserPatients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPatients" DROP CONSTRAINT "UserPatients_patientId_fkey";

-- DropForeignKey
ALTER TABLE "UserPatients" DROP CONSTRAINT "UserPatients_userId_fkey";

-- DropTable
DROP TABLE "UserPatients";

-- CreateTable
CREATE TABLE "UserPatient" (
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,
    "operationId" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPatient_userId_patientId_key" ON "UserPatient"("userId", "patientId");

-- AddForeignKey
ALTER TABLE "UserPatient" ADD CONSTRAINT "UserPatient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPatient" ADD CONSTRAINT "UserPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
