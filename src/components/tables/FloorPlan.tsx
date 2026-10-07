"use client";
import { TableStatus } from "@/types";
import {
  defaultLayout,
  type FloorLayout,
  type SeatPosition,
} from "@/lib/floor-layout";
import { TABLE_STATUS_CONFIG } from "@/lib/constants";
export type FloorTable = {
  number: string;
  status: TableStatus;
  connected?: boolean;
};
export function FloorPlan({
  tables,
  selected,
  onSelect,
  compact = false,
  layout,
  editing = false,
  onMove,
}: {
  tables: FloorTable[];
  selected?: string;
  onSelect: (number: string) => void;
  compact?: boolean;
  layout?: FloorLayout;
  editing?: boolean;
  onMove?: (number: string, position: Pick<SeatPosition, "x" | "y">) => void;
}) {
  const plan = layout || defaultLayout(tables.map((table) => table.number));
  return (
    <div className={`salon-plan ${compact ? "salon-compact" : ""}`}>
      <div className="salon-title">
        <span>{plan.name}</span>
        <span>
          {editing
            ? "Arraste ou use as setas do teclado"
            : layout
              ? "Layout do estabelecimento"
              : "Distribuição inicial"}
        </span>
      </div>
      <div
        className={`salon-canvas ${editing ? "salon-editing" : ""}`}
        role="group"
        aria-label="Layout de mesas"
      >
        <span className="salon-wall salon-wall-left" />
        <span className="salon-wall salon-wall-right" />
        <span className="salon-bar">Salão</span>
        {plan.positions.map((seat) => {
          const table = tables.find((item) => item.number === seat.number);
          if (!table) return null;
          return (
            <button
              type="button"
              key={seat.number}
              aria-label={`Mesa ${seat.number}, ${TABLE_STATUS_CONFIG[table.status].label}`}
              aria-pressed={selected === seat.number}
              className={`salon-seat ${selected === seat.number ? "salon-selected" : ""}`}
              data-status={table.status}
              style={{
                left: `${seat.x}%`,
                top: `${seat.y}%`,
                touchAction: editing ? "none" : "auto",
              }}
              onClick={() => onSelect(seat.number)}
              onPointerDown={(event) => {
                if (!editing) return;
                onSelect(seat.number);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (
                  !editing ||
                  !event.currentTarget.hasPointerCapture(event.pointerId)
                )
                  return;
                const rect =
                  event.currentTarget.parentElement!.getBoundingClientRect();
                onMove?.(seat.number, {
                  x: Math.max(
                    12,
                    Math.min(
                      88,
                      ((event.clientX - rect.left) / rect.width) * 100,
                    ),
                  ),
                  y: Math.max(
                    12,
                    Math.min(
                      88,
                      ((event.clientY - rect.top) / rect.height) * 100,
                    ),
                  ),
                });
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onKeyDown={(event) => {
                if (
                  !editing ||
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                onMove?.(seat.number, {
                  x: Math.max(
                    12,
                    Math.min(
                      88,
                      seat.x +
                        (event.key === "ArrowRight"
                          ? 2
                          : event.key === "ArrowLeft"
                            ? -2
                            : 0),
                    ),
                  ),
                  y: Math.max(
                    12,
                    Math.min(
                      88,
                      seat.y +
                        (event.key === "ArrowDown"
                          ? 2
                          : event.key === "ArrowUp"
                            ? -2
                            : 0),
                    ),
                  ),
                });
              }}
            >
              <span
                className={`salon-furniture salon-${seat.shape}`}
                style={{ transform: `rotate(${seat.rotation}deg)` }}
              >
                <i />
                <i />
                <i />
                <i />
                <span style={{ transform: `rotate(${-seat.rotation}deg)` }}>
                  {seat.number}
                </span>
                <b />
              </span>
              {table.connected === false ? <small>Offline</small> : null}
            </button>
          );
        })}
        <span className="salon-entrance">Entrada</span>
      </div>
      <div className="salon-legend">
        {(
          [
            "AVAILABLE",
            "CALLING",
            "ACKNOWLEDGED",
            "DO_NOT_DISTURB",
            "OFFLINE",
          ] as TableStatus[]
        ).map((status) => (
          <span key={status}>
            <i data-status={status} />
            {TABLE_STATUS_CONFIG[status].label}
          </span>
        ))}
      </div>
    </div>
  );
}
