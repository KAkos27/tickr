"use client";

import { Patient } from "@/generated/prisma/client";
import style from "@/styles/components/post-appointment.module.scss";
import { useMemo, useState } from "react";

export default function Teeth({
  selectedPatientId,
  patients,
  operations,
}: {
  selectedPatientId: string;
  patients: Array<
    Patient & {
      teeth: { toothCode: string; operations: { appointmentId: string }[] }[];
    }
  >;
  operations: Array<{ id: string; name: string; price: number }>;
}) {
  const [toothOperations, setToothOperations] = useState<
    Record<string, string[]>
  >({});

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

  return (
    <>
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
        <input
          type="hidden"
          name="toothOperations"
          value={serializedToothOperations}
          readOnly
        />
      </div>
    </>
  );
}
