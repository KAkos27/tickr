import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function OperationsPage() {
  const operations = await prisma.operation.findMany();

  return (
    <div>
      {operations.map((operation) => (
        <Link key={operation.id} href={`/dashboard/operations/${operation.id}`}>
          {operation.name}
        </Link>
      ))}

      <Link href="/dashboard/operations/new">
        <button>Új</button>
      </Link>
    </div>
  );
}
