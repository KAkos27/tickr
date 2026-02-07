import PostAppointment from "@/components/post-appointment";
import { createAppointment } from "@/lib/actions";
import { getOperations, getPatients } from "@/lib/querys";
import { decode } from "@/lib/utils";
import type { NewAppointmentParams, Params } from "@/types/route";
import { notFound } from "next/navigation";

import style from "@/styles/auth/dashboard/calendar/new/page.module.scss";

export default async function NewAppointmenttPage({
  params,
}: Params<NewAppointmentParams>) {
  const { time } = await params;

  if (time && time?.length > 2) {
    notFound();
  }

  const patients = await getPatients();
  const operations = await getOperations();

  const start = decode(time?.[0]);
  const end = decode(time?.[1]);

  console.log(start, end);

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
