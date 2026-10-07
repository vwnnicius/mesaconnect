"use client";
import { useEffect, useState } from "react";
import { Save, Pencil, LayoutGrid, RotateCcw } from "lucide-react";
import { useTables } from "@/hooks/useTables";
import { useFloorLayout } from "@/hooks/useFloorLayout";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { FloorPlan } from "@/components/tables/FloorPlan";
import { TableCard } from "@/components/tables/TableCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { defaultLayout, type SeatPosition } from "@/lib/floor-layout";
export default function TablesPage() {
  const { tables } = useTables();
  const { manager, demo } = useWorkspace();
  const floor = useFloorLayout();
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [list, setList] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const seat = floor.layout.positions.find((item) => item.number === selected);
  const update = (number: string, patch: Partial<SeatPosition>) => {
    floor.setLayout((prev) => ({
      ...prev,
      positions: prev.positions.map((item) =>
        item.number === number ? { ...item, ...patch } : item,
      ),
    }));
    setDirty(true);
    setMessage("");
  };
  const save = async () => {
    setSaving(true);
    try {
      await floor.save(floor.layout);
      setDirty(false);
      setMessage(
        demo
          ? "Layout salvo neste navegador de demonstração."
          : "Layout salvo para este estabelecimento.",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesas"
        description="Organize o salão do jeito que ele funciona na vida real."
        actions={
          <>
            <button className="action-outline" onClick={() => setList(!list)}>
              <LayoutGrid size={16} />
              {list ? "Ver planta" : "Ver lista"}
            </button>
            {manager ? (
              <button
                className="action-solid"
                onClick={() => {
                  setEditing(!editing);
                  setList(false);
                }}
              >
                <Pencil size={15} />
                {editing ? "Concluir edição" : "Personalizar salão"}
              </button>
            ) : null}
          </>
        }
      />
      {floor.error ? (
        <p role="alert" className="form-error">
          {floor.error}
        </p>
      ) : null}
      <div className={`floor-editor ${editing ? "floor-editor-active" : ""}`}>
        <section className="surface">
          {floor.loading ? (
            <p>Carregando salão…</p>
          ) : list ? (
            <div className="table-list-grid">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <FloorPlan
              tables={tables}
              layout={floor.layout}
              selected={selected}
              onSelect={setSelected}
              editing={editing}
              onMove={(number, position) => update(number, position)}
            />
          )}
        </section>
        {editing ? (
          <aside className="surface editor-inspector">
            <h2>Personalizar layout</h2>
            <label>
              Nome do salão
              <input
                maxLength={60}
                value={floor.layout.name}
                onChange={(event) => {
                  floor.setLayout({
                    ...floor.layout,
                    name: event.target.value,
                  });
                  setDirty(true);
                }}
              />
            </label>
            {seat ? (
              <>
                <h3>Mesa {seat.number}</h3>
                <label>
                  Formato
                  <select
                    value={seat.shape}
                    onChange={(event) =>
                      update(seat.number, {
                        shape: event.target.value as SeatPosition["shape"],
                      })
                    }
                  >
                    <option value="square">Quadrada</option>
                    <option value="round">Redonda</option>
                    <option value="rectangle">Retangular</option>
                  </select>
                </label>
                <label>
                  Lugares
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={seat.seats}
                    onChange={(event) =>
                      update(seat.number, {
                        seats: Math.max(
                          1,
                          Math.min(12, Number(event.target.value)),
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Setor
                  <input
                    maxLength={60}
                    value={seat.sector}
                    onChange={(event) =>
                      update(seat.number, { sector: event.target.value })
                    }
                  />
                </label>
                <label>
                  Rotação
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={seat.rotation}
                    onChange={(event) =>
                      update(seat.number, {
                        rotation: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <p>Arraste a mesa ou use as setas do teclado.</p>
              </>
            ) : (
              <p>Selecione uma mesa para editar formato, lugares e setor.</p>
            )}
            <button
              className="action-outline"
              onClick={() => {
                floor.setLayout(
                  defaultLayout(tables.map((table) => table.number)),
                );
                setDirty(true);
              }}
            >
              <RotateCcw size={15} />
              Organizar em grade
            </button>
          </aside>
        ) : selected ? (
          <aside className="surface editor-inspector">
            <h2>Mesa {selected}</h2>
            <p>{seat?.sector}</p>
            <p>{seat?.seats} lugares</p>
            {tables
              .filter((table) => table.number === selected)
              .map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
          </aside>
        ) : null}
      </div>
      {manager && dirty ? (
        <div className="save-bar">
          <span>Você tem alterações não salvas.</span>
          <button
            className="action-outline"
            onClick={async () => {
              await floor.reload();
              setDirty(false);
            }}
          >
            Descartar
          </button>
          <button className="action-solid" disabled={saving} onClick={save}>
            <Save size={15} />
            {saving ? "Salvando…" : "Salvar layout"}
          </button>
        </div>
      ) : null}
      {message ? (
        <p role="status" className="form-message">
          {message}
        </p>
      ) : null}
    </div>
  );
}
