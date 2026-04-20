import PostAppointment from "@/components/post-appointment";
import { createAppointment } from "@/lib/actions";
import { getOperations, getPatientsWithTeeth } from "@/lib/querys";
import { decode } from "@/lib/utils";
import type { NewAppointmentParams, Params } from "@/types/route";
import { notFound } from "next/navigation";

import style from "@/styles/pages/new-appointment-page.module.scss";

export default async function NewAppointmentPage({
  params,
}: Params<NewAppointmentParams>) {
  const { time } = await params;

  if (time && time?.length > 2) {
    notFound();
  }

  const [patients, operations] = await Promise.all([
    getPatientsWithTeeth(),
    getOperations(),
  ]);

  const start = decode(time?.[0]);
  const end = decode(time?.[1]);

  return (
    <div className={style.container}>
      <PostAppointment
        action={createAppointment}
        start={start}
        end={end}
        patients={patients}
        operations={operations}
      />
    </div>
  );
}
