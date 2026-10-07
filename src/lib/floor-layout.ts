export type SeatShape = "square" | "round" | "rectangle";
export interface SeatPosition {
  number: string;
  x: number;
  y: number;
  shape: SeatShape;
  seats: number;
  sector: string;
  rotation: number;
}
export interface FloorLayout {
  name: string;
  positions: SeatPosition[];
}
export function defaultLayout(numbers: string[]): FloorLayout {
  const columns = Math.min(4, Math.max(1, numbers.length));
  const rows = Math.max(1, Math.ceil(numbers.length / columns));
  return {
    name: "Salão principal",
    positions: numbers.map((number, i) => ({
      number,
      x: 13 + ((i % columns) * 74) / Math.max(1, columns - 1),
      y: 16 + (Math.floor(i / columns) * 68) / Math.max(1, rows - 1),
      shape: i % 4 === 0 ? "round" : "square",
      seats: 4,
      sector: "Salão principal",
      rotation: 0,
    })),
  };
}
export function normalizeLayout(
  value: unknown,
  numbers: string[],
): FloorLayout {
  const fallback = defaultLayout(numbers);
  if (
    !value ||
    typeof value !== "object" ||
    !("positions" in value) ||
    !Array.isArray(value.positions)
  )
    return fallback;
  const source = value.positions as Partial<SeatPosition>[];
  return {
    name:
      "name" in value && typeof value.name === "string"
        ? value.name.slice(0, 60)
        : fallback.name,
    positions: fallback.positions.map((seat) => {
      const item = source.find((p) => p && p.number === seat.number);
      if (!item) return seat;
      const bounded = (n: unknown, min: number, max: number, d: number) =>
        typeof n === "number" && Number.isFinite(n)
          ? Math.min(max, Math.max(min, n))
          : d;
      return {
        ...seat,
        x: bounded(item.x, 8, 92, seat.x),
        y: bounded(item.y, 12, 88, seat.y),
        shape: ["round", "square", "rectangle"].includes(item.shape || "")
          ? item.shape!
          : seat.shape,
        seats: Math.round(bounded(item.seats, 1, 12, 4)),
        sector:
          typeof item.sector === "string"
            ? item.sector.slice(0, 60)
            : seat.sector,
        rotation: bounded(item.rotation, 0, 360, 0),
      };
    }),
  };
}
