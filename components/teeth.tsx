"use client";

import style from "@/styles/components/teeth.module.scss";
import { SelectedPatient } from "@/types/domain";
import { useState } from "react";

export default function Teeth({
  selectedPatient,
  operations,
}: {
  selectedPatient: SelectedPatient;
  operations: Array<{ id: string; name: string; price: number }>;
}) {
  const [toothOperations, setToothOperations] = useState<
    Record<string, string[]>
  >({});

  const patientTeeth = (
    selectedPatient?.teeth.map((tooth) => ({
      toothCode: tooth.toothCode,
      hasHistory: (tooth.operations?.length ?? 0) > 0,
    })) ?? []
  ).sort((a, b) => a.toothCode.localeCompare(b.toothCode));

  const selectedTeeth = Object.keys(toothOperations).sort();

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

  const serializedToothOperations = JSON.stringify(
    selectedTeeth.map((toothCode) => ({
      toothCode,
      operationIds: toothOperations[toothCode] ?? [],
    })),
  );

  return (
    <>
      <div className={style.teethSection}>
        <label>Fogak</label>
        {!selectedPatient && <small>Válassz pácienst a fogakhoz.</small>}
        {selectedPatient && (
          <div className={style.teethGrid}>
            <div className={style.teethRow}>
              <div className={style.left}>
                {patientTeeth.map((tooth) => {
                  const isSelected =
                    toothOperations[tooth.toothCode] !== undefined;
                  const className = isSelected
                    ? style.toothButtonSelected
                    : tooth.hasHistory
                      ? style.toothButtonHistory
                      : style.toothButton;
                  const toothCode = Number.parseInt(tooth.toothCode);
                  return toothCode <= 18 ? (
                    <button
                      key={tooth.toothCode}
                      type="button"
                      className={className}
                      onClick={() => toggleTooth(tooth.toothCode)}
                    >
                      {tooth.toothCode}
                    </button>
                  ) : null;
                })}
              </div>
              <div className={style.right}>
                {patientTeeth.map((tooth) => {
                  const isSelected =
                    toothOperations[tooth.toothCode] !== undefined;
                  const className = isSelected
                    ? style.toothButtonSelected
                    : tooth.hasHistory
                      ? style.toothButtonHistory
                      : style.toothButton;
                  const toothCode = Number.parseInt(tooth.toothCode);
                  return toothCode >= 21 && toothCode <= 28 ? (
                    <button
                      key={tooth.toothCode}
                      type="button"
                      className={className}
                      onClick={() => toggleTooth(tooth.toothCode)}
                    >
                      {tooth.toothCode}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
            <div className={style.teethRow}>
              <div className={style.left}>
                {patientTeeth.map((tooth) => {
                  const isSelected =
                    toothOperations[tooth.toothCode] !== undefined;
                  const className = isSelected
                    ? style.toothButtonSelected
                    : tooth.hasHistory
                      ? style.toothButtonHistory
                      : style.toothButton;
                  const toothCode = Number.parseInt(tooth.toothCode);
                  return toothCode >= 41 ? (
                    <button
                      key={tooth.toothCode}
                      type="button"
                      className={className}
                      onClick={() => toggleTooth(tooth.toothCode)}
                    >
                      {tooth.toothCode}
                    </button>
                  ) : null;
                })}
              </div>
              <div className={style.right}>
                {patientTeeth.map((tooth) => {
                  const isSelected =
                    toothOperations[tooth.toothCode] !== undefined;
                  const className = isSelected
                    ? style.toothButtonSelected
                    : tooth.hasHistory
                      ? style.toothButtonHistory
                      : style.toothButton;
                  const toothCode = Number.parseInt(tooth.toothCode);
                  return toothCode >= 31 && toothCode <= 38 ? (
                    <button
                      key={tooth.toothCode}
                      type="button"
                      className={className}
                      onClick={() => toggleTooth(tooth.toothCode)}
                    >
                      {tooth.toothCode}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
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
                        {operation.name} {operation.price} Ft
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
