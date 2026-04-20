"use client";

import { useActionState, useState } from "react";
import FormSubmit from "./form-submit";
import type { Patient } from "@/generated/prisma/client";
import type { ToothStatus } from "@/generated/prisma/enums";
import type { CreateAppointmentState, FormAction } from "@/types/common";

import style from "@/styles/components/post-appointment.module.scss";
import { useRouter } from "next/navigation";
import Teeth from "./teeth";

export default function PostAppointment({
  action,
  patients,
  operations,
  start,
  end,
}: {
  action: FormAction<CreateAppointmentState>;
  patients: Array<
    Patient & {
      teeth: { toothCode: string; status: ToothStatus; operations: { appointmentId: string }[] }[];
    }
  >;
  operations: Array<{ id: string; name: string; price: number }>;
  start: string | null;
  end: string | null;
}) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [state, formAction] = useActionState<CreateAppointmentState, FormData>(
    action,
    {},
  );

  const selectedPatient = patients.find(
    (patient) => patient.id === selectedPatientId,
  );

  const handlePatientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPatientId = event.target.value;
    setSelectedPatientId(nextPatientId);
  };

  const handleCancelNewAppointment = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    router.back();
  };

  return (
    <form action={formAction} className={style.appointmentForm}>
      <div>
        <label htmlFor="patient">Páciens</label>
        <select
          name="patient"
          value={selectedPatientId}
          onChange={handlePatientChange}
        >
          <option value="">-</option>
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
      <Teeth
        key={selectedPatientId}
        selectedPatient={selectedPatient}
        operations={operations}
      />
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
      <div className={style.actions}>
        <button
          type="button"
          className={style.cancelButton}
          onClick={handleCancelNewAppointment}
        >
          Mégsem
        </button>
        <FormSubmit buttonText="Mentés" pendingText="Betöltés..." />
      </div>
    </form>
  );
}
