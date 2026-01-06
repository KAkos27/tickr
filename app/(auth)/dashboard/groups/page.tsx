import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function GroupsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const userGroups = await prisma.group.findMany({
    where: { groupUsers: { some: { userId } } },
  });

  return (
    <div>
      {userGroups.map((group) => (
        <Link href={`/dashboard/groups/${group.id}`} key={group.id}>
          {group.name}
        </Link>
      ))}
    </div>
  );
}
