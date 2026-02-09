/*
  Warnings:

  - You are about to drop the column `operationId` on the `Appointment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_operationId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "operationId";
