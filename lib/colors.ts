export const ALLOWED_COLORS = [
  "#5d8da8",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
] as const;

export type AllowedColor = (typeof ALLOWED_COLORS)[number];
