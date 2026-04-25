"use client";

import {
  memo,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ToothStatus } from "@/generated/prisma/enums";
import {
  TOOTH_STATUS_LABELS,
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_OPTIONS,
} from "@/lib/tooth-status";
import type { FormAction } from "@/types/common";

import style from "@/styles/components/tooth-chart.module.scss";

type ToothData = {
  toothCode: string;
  status: ToothStatus;
  hasHistory: boolean;
};

type ToothChartProps = {
  teeth: ToothData[];
  mode: "status" | "treatment";
  patientId?: string;
  updateStatusAction?: FormAction<{ message?: string }>;
  operations?: Array<{ id: string; name: string; price: number }>;
  toothOperations?: Record<string, string[]>;
  onToggleTooth?: (toothCode: string) => void;
  onToggleOperation?: (toothCode: string, operationId: string) => void;
};

type Dentition = "permanent" | "deciduous";

const PERMANENT_RANGES: [number, number][] = [
  [18, 11],
  [21, 28],
  [48, 41],
  [31, 38],
];

const DECIDUOUS_RANGES: [number, number][] = [
  [55, 51],
  [61, 65],
  [85, 81],
  [71, 75],
];

function buildQuadrantCodes(range: [number, number]): string[] {
  const [start, end] = range;
  const codes: string[] = [];
  if (start > end) {
    for (let i = start; i >= end; i--) codes.push(String(i));
  } else {
    for (let i = start; i <= end; i++) codes.push(String(i));
  }
  return codes;
}

const PERMANENT_CODES = PERMANENT_RANGES.map(buildQuadrantCodes);
const DECIDUOUS_CODES = DECIDUOUS_RANGES.map(buildQuadrantCodes);

const DEFAULT_TOOTH: Omit<ToothData, "toothCode"> = {
  status: "HEALTHY" as ToothStatus,
  hasHistory: false,
};

const ToothButton = memo(function ToothButton({
  tooth,
  isSelected,
  mode,
  onToothClick,
}: {
  tooth: ToothData;
  isSelected: boolean;
  mode: "status" | "treatment";
  onToothClick: (toothCode: string) => void;
}) {
  const handleClick = useCallback(() => {
    onToothClick(tooth.toothCode);
  }, [onToothClick, tooth.toothCode]);

  const statusColor = TOOTH_STATUS_COLORS[tooth.status];
  const isMissing = tooth.status === "MISSING";

  return (
    <button
      type="button"
      className={`${style.tooth} ${isSelected ? style.toothSelected : ""} ${
        isMissing ? style.toothMissing : ""
      }`}
      onClick={handleClick}
      title={`${tooth.toothCode} - ${TOOTH_STATUS_LABELS[tooth.status]}`}
    >
      <span className={style.toothCode}>{tooth.toothCode}</span>
      <span
        className={style.toothStatusBar}
        style={{ backgroundColor: statusColor }}
      />
      {tooth.hasHistory && mode === "status" && (
        <span className={style.toothHistoryDot} />
      )}
    </button>
  );
});

export default function ToothChart({
  teeth,
  mode,
  patientId,
  updateStatusAction,
  operations,
  toothOperations,
  onToggleTooth,
  onToggleOperation,
}: ToothChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [dentition, setDentition] = useState<Dentition>("permanent");

  const activeQuadrants =
    dentition === "permanent" ? PERMANENT_CODES : DECIDUOUS_CODES;

  const completeTeethMap = useMemo(() => {
    const known = new Map<string, ToothData>();
    for (const t of teeth) known.set(t.toothCode, t);

    const map = new Map<string, ToothData>();
    const allCodes = [...PERMANENT_CODES, ...DECIDUOUS_CODES];
    for (const quadrant of allCodes) {
      for (const code of quadrant) {
        map.set(code, known.get(code) ?? { toothCode: code, ...DEFAULT_TOOTH });
      }
    }
    return map;
  }, [teeth]);

  const getToothData = useCallback(
    (code: string): ToothData => completeTeethMap.get(code)!,
    [completeTeethMap],
  );

  const handleToothClick = useCallback(
    (toothCode: string) => {
      if (mode === "status") {
        setSelectedTooth((prev) => (prev === toothCode ? null : toothCode));
      } else if (mode === "treatment" && onToggleTooth) {
        onToggleTooth(toothCode);
      }
    },
    [mode, onToggleTooth],
  );

  const selectedTeeth = useMemo(
    () =>
      mode === "treatment" && toothOperations
        ? Object.keys(toothOperations)
        : [],
    [mode, toothOperations],
  );

  const selectedTeethSet = useMemo(
    () => new Set(selectedTeeth),
    [selectedTeeth],
  );

  const selectedToothData = useMemo(
    () =>
      mode === "status" && selectedTooth ? getToothData(selectedTooth) : null,
    [mode, selectedTooth, getToothData],
  );

  const sortedSelectedTeeth = useMemo(
    () => [...selectedTeeth].sort(),
    [selectedTeeth],
  );

  return (
    <div className={style.container}>
      <div className={style.dentitionToggle}>
        <button
          type="button"
          className={`${style.dentitionButton} ${dentition === "permanent" ? style.dentitionButtonActive : ""}`}
          onClick={() => setDentition("permanent")}
        >
          Maradó fogak
        </button>
        <button
          type="button"
          className={`${style.dentitionButton} ${dentition === "deciduous" ? style.dentitionButtonActive : ""}`}
          onClick={() => setDentition("deciduous")}
        >
          Tejfogak
        </button>
      </div>

      <div className={style.chart} data-dentition={dentition}>
        {/* Upper jaw */}
        <div className={style.jaw}>
          <div className={style.quadrant}>
            {activeQuadrants[0].map((code) => {
              const tooth = getToothData(code);
              return (
                <ToothButton
                  key={code}
                  tooth={tooth}
                  isSelected={
                    mode === "status"
                      ? selectedTooth === code
                      : selectedTeethSet.has(code)
                  }
                  mode={mode}
                  onToothClick={handleToothClick}
                />
              );
            })}
          </div>
          <div className={style.divider} />
          <div className={style.quadrant}>
            {activeQuadrants[1].map((code) => {
              const tooth = getToothData(code);
              return (
                <ToothButton
                  key={code}
                  tooth={tooth}
                  isSelected={
                    mode === "status"
                      ? selectedTooth === code
                      : selectedTeethSet.has(code)
                  }
                  mode={mode}
                  onToothClick={handleToothClick}
                />
              );
            })}
          </div>
        </div>

        <div className={style.jawSeparator} />

        {/* Lower jaw */}
        <div className={style.jaw}>
          <div className={style.quadrant}>
            {activeQuadrants[2].map((code) => {
              const tooth = getToothData(code);
              return (
                <ToothButton
                  key={code}
                  tooth={tooth}
                  isSelected={
                    mode === "status"
                      ? selectedTooth === code
                      : selectedTeethSet.has(code)
                  }
                  mode={mode}
                  onToothClick={handleToothClick}
                />
              );
            })}
          </div>
          <div className={style.divider} />
          <div className={style.quadrant}>
            {activeQuadrants[3].map((code) => {
              const tooth = getToothData(code);
              return (
                <ToothButton
                  key={code}
                  tooth={tooth}
                  isSelected={
                    mode === "status"
                      ? selectedTooth === code
                      : selectedTeethSet.has(code)
                  }
                  mode={mode}
                  onToothClick={handleToothClick}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className={style.legend}>
        {TOOTH_STATUS_OPTIONS.map((status) => (
          <span key={status} className={style.legendItem}>
            <span
              className={style.legendDot}
              style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
            />
            {TOOTH_STATUS_LABELS[status]}
          </span>
        ))}
      </div>

      {mode === "status" &&
        selectedToothData &&
        updateStatusAction &&
        patientId && (
          <ToothStatusPanel
            tooth={selectedToothData}
            patientId={patientId}
            action={updateStatusAction}
          />
        )}

      {mode === "treatment" &&
        sortedSelectedTeeth.length > 0 &&
        operations &&
        toothOperations &&
        onToggleOperation &&
        onToggleTooth && (
          <TreatmentPanel
            sortedSelectedTeeth={sortedSelectedTeeth}
            getToothData={getToothData}
            operations={operations}
            toothOperations={toothOperations}
            onToggleOperation={onToggleOperation}
            onRemoveTooth={onToggleTooth}
          />
        )}
    </div>
  );
}

const TreatmentPanel = memo(function TreatmentPanel({
  sortedSelectedTeeth,
  getToothData,
  operations,
  toothOperations,
  onToggleOperation,
  onRemoveTooth,
}: {
  sortedSelectedTeeth: string[];
  getToothData: (code: string) => ToothData;
  operations: Array<{ id: string; name: string; price: number }>;
  toothOperations: Record<string, string[]>;
  onToggleOperation: (toothCode: string, operationId: string) => void;
  onRemoveTooth: (toothCode: string) => void;
}) {
  const [expandedTooth, setExpandedTooth] = useState<string | null>(
    sortedSelectedTeeth[0] ?? null,
  );

  const prevCount = useRef(sortedSelectedTeeth.length);
  useEffect(() => {
    if (sortedSelectedTeeth.length > prevCount.current) {
      setExpandedTooth(sortedSelectedTeeth[sortedSelectedTeeth.length - 1]);
    }
    prevCount.current = sortedSelectedTeeth.length;
  }, [sortedSelectedTeeth]);

  const operationMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; price: number }>();
    for (const op of operations) map.set(op.id, op);
    return map;
  }, [operations]);

  const total = useMemo(() => {
    let sum = 0;
    for (const toothCode of sortedSelectedTeeth) {
      const ids = toothOperations[toothCode] ?? [];
      for (const id of ids) {
        const op = operationMap.get(id);
        if (op) sum += op.price;
      }
    }
    return sum;
  }, [sortedSelectedTeeth, toothOperations, operationMap]);

  return (
    <div className={style.treatmentSection}>
      {/* Chip bar: selected teeth */}
      <div className={style.chipBar}>
        <span className={style.chipBarLabel}>Kijelölt fogak</span>
        <div className={style.chipRow}>
          {sortedSelectedTeeth.map((code) => {
            const count = (toothOperations[code] ?? []).length;
            return (
              <button
                key={code}
                type="button"
                className={`${style.chip} ${expandedTooth === code ? style.chipActive : ""}`}
                onClick={() =>
                  setExpandedTooth((prev) => (prev === code ? null : code))
                }
              >
                <span>{code}</span>
                {count > 0 && <span className={style.chipBadge}>{count}</span>}
                <span
                  className={style.chipRemove}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTooth(code);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      onRemoveTooth(code);
                    }
                  }}
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {expandedTooth && toothOperations[expandedTooth] !== undefined && (
        <TreatmentGroup
          key={expandedTooth}
          toothCode={expandedTooth}
          toothData={getToothData(expandedTooth)}
          operations={operations}
          selectedOperationIds={toothOperations[expandedTooth] ?? []}
          onToggleOperation={onToggleOperation}
        />
      )}

      {total > 0 && (
        <div className={style.treatmentTotal}>
          <span>Összesen</span>
          <strong>{total.toLocaleString("hu-HU")} Ft</strong>
        </div>
      )}
    </div>
  );
});

const TreatmentGroup = memo(function TreatmentGroup({
  toothCode,
  toothData,
  operations,
  selectedOperationIds,
  onToggleOperation,
}: {
  toothCode: string;
  toothData: ToothData;
  operations: Array<{ id: string; name: string; price: number }>;
  selectedOperationIds: string[];
  onToggleOperation: (toothCode: string, operationId: string) => void;
}) {
  const selectedSet = useMemo(
    () => new Set(selectedOperationIds),
    [selectedOperationIds],
  );

  return (
    <div className={style.treatmentGroup}>
      <div className={style.treatmentGroupHeader}>
        <span className={style.treatmentGroupTitle}>Fog {toothCode}</span>
        <span
          className={style.treatmentGroupStatus}
          style={{ color: TOOTH_STATUS_COLORS[toothData.status] }}
        >
          {TOOTH_STATUS_LABELS[toothData.status]}
        </span>
      </div>
      <div className={style.treatmentList}>
        {operations.map((operation) => {
          const checked = selectedSet.has(operation.id);
          return (
            <label
              key={operation.id}
              className={`${style.treatmentOption} ${checked ? style.treatmentOptionChecked : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleOperation(toothCode, operation.id)}
              />
              <span className={style.treatmentName}>{operation.name}</span>
              <span className={style.treatmentPrice}>
                {operation.price.toLocaleString("hu-HU")} Ft
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
});

function ToothStatusPanel({
  tooth,
  patientId,
  action,
}: {
  tooth: ToothData;
  patientId: string;
  action: FormAction<{ message?: string }>;
}) {
  const [state, formAction] = useActionState<{ message?: string }, FormData>(
    action,
    {},
  );

  return (
    <div className={style.statusPanel}>
      <div className={style.statusPanelHeader}>
        <h3>Fog {tooth.toothCode}</h3>
        <span
          className={style.currentStatus}
          style={{ color: TOOTH_STATUS_COLORS[tooth.status] }}
        >
          {TOOTH_STATUS_LABELS[tooth.status]}
        </span>
      </div>
      <div className={style.statusGrid}>
        {TOOTH_STATUS_OPTIONS.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="patientId" value={patientId} />
            <input type="hidden" name="toothCode" value={tooth.toothCode} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              className={`${style.statusOption} ${
                tooth.status === status ? style.statusOptionActive : ""
              }`}
              style={{
                borderColor:
                  tooth.status === status
                    ? TOOTH_STATUS_COLORS[status]
                    : undefined,
              }}
            >
              <span
                className={style.statusDot}
                style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
              />
              {TOOTH_STATUS_LABELS[status]}
            </button>
          </form>
        ))}
      </div>
      {state.message && (
        <span className={style.statusFeedback}>{state.message}</span>
      )}
    </div>
  );
}
