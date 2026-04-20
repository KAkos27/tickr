import type { ToothStatus } from "@/generated/prisma/enums";

/**
 * Maps operation names to the tooth status they leave behind.
 * Only operations that change status are listed here.
 * If an operation is not in this map, it does not affect tooth status.
 */
export const OPERATION_STATUS_MAP: Record<string, ToothStatus> = {
  "Foghúzás": "MISSING",
  "Tömés": "FILLING",
  "Gyökérkezelés": "ROOT_CANAL",
  "Korona készítés": "CROWN",
  "Implantátum beültetés": "IMPLANT",
  "Híd pillér készítés": "BRIDGE",
};
