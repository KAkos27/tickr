"use client";

import { useActionState, useMemo, useState } from "react";
import FormSubmit from "./form-submit";
import { Operation, Patient } from "@/generated/prisma/client";
import type { CreateAppointmentState, FormAction } from "@/types/common";

import style from "@/styles/components/post-appointment.module.scss";
import { useRouter } from "next/navigation";

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
      teeth: { toothCode: string; operations: { appointmentId: string }[] }[];
    }
  >;
  operations: Operation[];
  start: string | null;
  end: string | null;
}) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [toothOperations, setToothOperations] = useState<
    Record<string, string[]>
  >({});

  const [state, formAction] = useActionState<CreateAppointmentState, FormData>(
    action,
    {},
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const patientTeeth = useMemo(() => {
    const teeth =
      selectedPatient?.teeth.map((tooth) => ({
        toothCode: tooth.toothCode,
        hasHistory: (tooth.operations?.length ?? 0) > 0,
      })) ?? [];
    return teeth.sort((a, b) => a.toothCode.localeCompare(b.toothCode));
  }, [selectedPatient]);

  const selectedTeeth = useMemo(
    () => Object.keys(toothOperations).sort(),
    [toothOperations],
  );

  const handlePatientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPatientId = event.target.value;
    setSelectedPatientId(nextPatientId);
    setToothOperations({});
  };

  const toggleTooth = (toothCode: string) => {
    setToothOperations((prev) => {
      if (prev[toothCode]) {
        const next = { ...prev };
        delete next[toothCode];
        return next;
      }
      return { ...prev, [toothCode]: [] };
    });
  };

  const toggleToothOperation = (toothCode: string, operationId: string) => {
    setToothOperations((prev) => {
      const current = prev[toothCode] ?? [];
      const exists = current.includes(operationId);
      const nextOps = exists
        ? current.filter((id) => id !== operationId)
        : [...current, operationId];
      return { ...prev, [toothCode]: nextOps };
    });
  };

  const serializedToothOperations = useMemo(
    () =>
      JSON.stringify(
        selectedTeeth.map((toothCode) => ({
          toothCode,
          operationIds: toothOperations[toothCode] ?? [],
        })),
      ),
    [selectedTeeth, toothOperations],
  );

  const handleCancelNewAppointment = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    router.back();
  };

  return (
    <form action={formAction} className={style.appointmentForm}>
      {/* <div>
        <label htmlFor="title">Név</label>
        <input type="text" name="title" />
        {state.error?.title?.map((error) => (
          <small key={error}>{error}</small>
        ))}
      </div> */}
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
      <div className={style.teethSection}>
        <label>Fogak</label>
        {!selectedPatient && <small>Válassz pácienst a fogakhoz.</small>}
        {selectedPatient && (
          <div className={style.teethGrid}>
            {patientTeeth.map((tooth) => {
              const isSelected = toothOperations[tooth.toothCode] !== undefined;
              const className = isSelected
                ? style.toothButtonSelected
                : tooth.hasHistory
                  ? style.toothButtonHistory
                  : style.toothButton;
              return (
                <button
                  key={tooth.toothCode}
                  type="button"
                  className={className}
                  onClick={() => toggleTooth(tooth.toothCode)}
                >
                  {tooth.toothCode}
                </button>
              );
            })}
          </div>
        )}
        {selectedTeeth.length > 0 && (
          <div className={style.toothOperations}>
            {selectedTeeth.map((toothCode) => (
              <div key={toothCode} className={style.toothOperationGroup}>
                <span>Fog {toothCode}</span>
                <div className={style.toothOperationList}>
                  {operations.map((operation) => {
                    const checked =
                      toothOperations[toothCode]?.includes(operation.id) ??
                      false;
                    return (
                      <label key={operation.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleToothOperation(toothCode, operation.id)
                          }
                        />
                        {operation.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {state.error?.teeth?.map((error) => (
          <small key={error}>{error}</small>
        ))}
        <input
          type="hidden"
          name="toothOperations"
          value={serializedToothOperations}
          readOnly
        />
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
      <button onClick={handleCancelNewAppointment}>Mégsem</button>
      <FormSubmit buttonText="OK" pedingText="Betöltés..." />
    </form>
  );
}
