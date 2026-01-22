import prisma from "@/lib/prisma";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

export default async function OperationPage({
  params,
}: Params<{ id: string }>) {
  const id = (await params).id;
  const operation = await prisma.operation.findUnique({ where: { id } });

  if (!operation) {
    notFound();
  }

  return (
    <div>
      <div>{operation.name}</div>
      <div>{operation.price} Ft</div>
    </div>
  );
}
