import { redirect } from "next/navigation";
import { getActiveClinic } from "@/lib/querys";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeClinic = await getActiveClinic();

  if (!activeClinic) {
    redirect("/dashboard/clinics");
  }

  return <>{children}</>;
}
