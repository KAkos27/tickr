-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('HEALTHY', 'CARIES', 'MISSING', 'CROWN', 'FILLING', 'IMPACTED', 'ROOT_CANAL', 'BRIDGE', 'IMPLANT');

-- AlterTable
ALTER TABLE "PatientTooth" ADD COLUMN     "status" "ToothStatus" NOT NULL DEFAULT 'HEALTHY';
