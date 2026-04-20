import type { ToothStatus } from "@/generated/prisma/enums";

export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  HEALTHY: "Egészséges",
  CARIES: "Szuvasodás",
  MISSING: "Hiányzó",
  CROWN: "Korona",
  FILLING: "Tömés",
  IMPACTED: "Impaktált",
  ROOT_CANAL: "Gyökérkezelt",
  BRIDGE: "Híd",
  IMPLANT: "Implantátum",
};

export const TOOTH_STATUS_COLORS: Record<ToothStatus, string> = {
  HEALTHY: "#22c55e",
  CARIES: "#ef4444",
  MISSING: "#94a3b8",
  CROWN: "#f97316",
  FILLING: "#3b82f6",
  IMPACTED: "#a855f7",
  ROOT_CANAL: "#eab308",
  BRIDGE: "#06b6d4",
  IMPLANT: "#ec4899",
};

export const TOOTH_STATUS_OPTIONS: ToothStatus[] = [
  "HEALTHY",
  "CARIES",
  "MISSING",
  "CROWN",
  "FILLING",
  "IMPACTED",
  "ROOT_CANAL",
  "BRIDGE",
  "IMPLANT",
];
