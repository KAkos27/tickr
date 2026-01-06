-- AlterTable
ALTER TABLE "users" ADD COLUMN     "groupUserId" TEXT;

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupUserId" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupUser" (
    "id" TEXT NOT NULL,

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_groupUserId_fkey" FOREIGN KEY ("groupUserId") REFERENCES "GroupUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_groupUserId_fkey" FOREIGN KEY ("groupUserId") REFERENCES "GroupUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
