/*
  Warnings:

  - You are about to drop the column `endTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Appointment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Operation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `patientId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `operationId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_operationId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "patientId" SET NOT NULL,
ALTER COLUMN "operationId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Operation_name_key" ON "Operation"("name");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
