/*
  Warnings:

  - You are about to drop the column `clinicId` on the `Operation` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Operation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Operation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Operation" DROP CONSTRAINT "Operation_clinicId_fkey";

-- DropIndex
DROP INDEX "Operation_clinicId_name_key";

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "clinicId",
DROP COLUMN "price";

-- CreateTable
CREATE TABLE "ClinicOperationPrice" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ClinicOperationPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicOperationPrice_clinicId_operationId_key" ON "ClinicOperationPrice"("clinicId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_name_key" ON "Operation"("name");

-- AddForeignKey
ALTER TABLE "ClinicOperationPrice" ADD CONSTRAINT "ClinicOperationPrice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicOperationPrice" ADD CONSTRAINT "ClinicOperationPrice_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
