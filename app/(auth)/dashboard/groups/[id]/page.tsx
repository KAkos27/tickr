import type { Params } from "@/types/route";

export default async function GroupPage({ params }: Params<{ id: string }>) {
  const { id } = await params;
  return <div>{id}</div>;
}
