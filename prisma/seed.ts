import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import "dotenv/config";

const userData: Prisma.UserCreateInput[] = [];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();
