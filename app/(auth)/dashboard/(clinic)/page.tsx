import { getActiveClinic } from "@/lib/querys";

export default async function DashboardPage() {
  const activeClinic = await getActiveClinic();

  return <div>{activeClinic!.name} dashboard</div>;
}
