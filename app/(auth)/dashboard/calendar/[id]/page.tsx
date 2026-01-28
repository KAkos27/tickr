import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

export default async function AppointmentPage({
  params,
}: Params<{ id: string }>) {
  const appointmentId = (await params).id;
  //TODO
  if (!appointmentId) {
    notFound();
  }

  return <div>{appointmentId}</div>;
}
