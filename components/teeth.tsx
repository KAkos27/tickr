"use client";

import { useCallback, useMemo, useState } from "react";
import type { ToothStatus } from "@/generated/prisma/enums";
import type { SelectedPatient } from "@/types/domain";
import ToothChart from "@/components/tooth-chart";

export default function Teeth({
  selectedPatient,
  operations,
}: {
  selectedPatient: SelectedPatient | null;
  operations: Array<{ id: string; name: string; price: number }>;
}) {
  const [toothOperations, setToothOperations] = useState<
    Record<string, string[]>
  >({});

  const teeth = useMemo(
    () =>
      selectedPatient?.teeth.map((tooth) => ({
        toothCode: tooth.toothCode,
        status: tooth.status as ToothStatus,
        hasHistory: (tooth.operations?.length ?? 0) > 0,
      })) ?? [],
    [selectedPatient],
  );

  const toggleTooth = useCallback((toothCode: string) => {
    setToothOperations((prev) => {
      if (prev[toothCode]) {
        const next = { ...prev };
        delete next[toothCode];
        return next;
      }
      return { ...prev, [toothCode]: [] };
    });
  }, []);

  const toggleToothOperation = useCallback(
    (toothCode: string, operationId: string) => {
      setToothOperations((prev) => {
        const current = prev[toothCode] ?? [];
        const exists = current.includes(operationId);
        const nextOps = exists
          ? current.filter((id) => id !== operationId)
          : [...current, operationId];
        return { ...prev, [toothCode]: nextOps };
      });
    },
    [],
  );

  const serializedToothOperations = useMemo(() => {
    const selectedTeeth = Object.keys(toothOperations).sort();
    return JSON.stringify(
      selectedTeeth.map((toothCode) => ({
        toothCode,
        operationIds: toothOperations[toothCode] ?? [],
      })),
    );
  }, [toothOperations]);

  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: "block" }}>
        Fogak
      </label>
      {!selectedPatient && (
        <small style={{ color: "rgba(17,24,39,0.64)" }}>
          Válassz pácienst a fogakhoz.
        </small>
      )}
      {selectedPatient && (
        <ToothChart
          teeth={teeth}
          mode="treatment"
          operations={operations}
          toothOperations={toothOperations}
          onToggleTooth={toggleTooth}
          onToggleOperation={toggleToothOperation}
        />
      )}
      <input
        type="hidden"
        name="toothOperations"
        value={serializedToothOperations}
        readOnly
      />
    </div>
  );
}
