-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_operationId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "operationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
