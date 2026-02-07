"use client";

import { useActionState } from "react";
import FormSubmit from "./form-submit";
import { Operation, Patient } from "@/generated/prisma/client";
import type { CreateAppointmentState, FormAction } from "@/types/common";

import style from "@/styles/components/post-appointment.module.scss";

export default function PostAppointment({
  action,
  patients,
  operations,
  start,
  end,
}: {
  action: FormAction<CreateAppointmentState>;
  patients: Patient[];
  operations: Operation[];
  start: string | null;
  end: string | null;
}) {
  const [state, formAction] = useActionState<CreateAppointmentState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className={style.appointmentForm}>
      <div>
        <label htmlFor="title">Név</label>
        <input type="text" name="title" />
        {state.error?.title?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div>
      <div>
        <label htmlFor="patient">Páciens</label>
        <select name="patient">
          <option>-</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
        {state.error?.patient?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div>
      <div>
        <label htmlFor="operation">Beavatkozás</label>
        <select name="operation">
          <option>-</option>
          {operations.map((operation) => (
            <option key={operation.id} value={operation.id}>
              {operation.name}
            </option>
          ))}
        </select>
        {state.error?.operation?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div>
      <div>
        <label htmlFor="start">Kezdete</label>
        <input
          type="datetime-local"
          name="start"
          defaultValue={start ? start : ""}
        />
        {state.error?.date?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div>
      <div>
        <label htmlFor="end">Vége</label>
        <input type="datetime-local" name="end" defaultValue={end ? end : ""} />
        {state.error?.date?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div>
      <FormSubmit buttonText="ok" pedingText="Betöltés..." />
    </form>
  );
}
