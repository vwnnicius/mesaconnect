import { Table, ServiceCall, Evaluation, TableStatus } from "@/types";
import {
  INITIAL_DEMO_TABLES,
  INITIAL_DEMO_CALLS,
  INITIAL_DEMO_EVALUATIONS,
} from "@/lib/demo-data";

// Armazenamento em memória local compartilhado quando o Supabase estiver em modo Demo/Offline
class InMemoryStore {
  private tables: Table[] = JSON.parse(JSON.stringify(INITIAL_DEMO_TABLES));
  private calls: ServiceCall[] = JSON.parse(JSON.stringify(INITIAL_DEMO_CALLS));
  private evaluations: Evaluation[] = JSON.parse(
    JSON.stringify(INITIAL_DEMO_EVALUATIONS),
  );
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getTables(): Table[] {
    return [...this.tables];
  }

  updateTableStatus(tableId: string, status: TableStatus): Table | undefined {
    const table = this.tables.find((t) => t.id === tableId);
    if (table) {
      table.status = status;
      if (
        status === "AVAILABLE" ||
        status === "COMPLETED" ||
        status === "DO_NOT_DISTURB"
      ) {
        table.active_call_id = null;
        table.active_call_requested_at = null;
      }
      this.notify();
    }
    return table;
  }

  getCalls(): ServiceCall[] {
    return [...this.calls];
  }

  createCall(tableId: string, restaurantId: string): ServiceCall {
    const existing = this.calls.find(
      (c) =>
        c.table_id === tableId &&
        (c.status === "CALLING" || c.status === "ACKNOWLEDGED"),
    );
    if (existing) return existing;
    const table = this.tables.find((t) => t.id === tableId);
    const newCall: ServiceCall = {
      id: crypto.randomUUID(),
      restaurant_id: restaurantId,
      table_id: tableId,
      table_number: table?.number || "??",
      requested_at: new Date().toISOString(),
      acknowledged_at: null,
      completed_at: null,
      status: "CALLING",
      requested_by: "SIMULATOR",
      acknowledged_by: null,
      completed_by: null,
      created_at: new Date().toISOString(),
    };

    this.calls.unshift(newCall);
    if (table) {
      table.status = "CALLING";
      table.active_call_id = newCall.id;
      table.active_call_requested_at = newCall.requested_at;
    }
    this.notify();
    return newCall;
  }

  acknowledgeCall(
    callId: string,
    staffName = "Garçom",
  ): ServiceCall | undefined {
    const call = this.calls.find((c) => c.id === callId);
    if (call?.status === "CALLING") {
      call.status = "ACKNOWLEDGED";
      call.acknowledged_at = new Date().toISOString();
      call.acknowledged_by = staffName;
      const table = this.tables.find((t) => t.id === call.table_id);
      if (table) {
        table.status = "ACKNOWLEDGED";
      }
      this.notify();
      return call;
    }
    return undefined;
  }

  completeCall(callId: string, staffName = "Garçom"): ServiceCall | undefined {
    const call = this.calls.find((c) => c.id === callId);
    if (call?.status === "ACKNOWLEDGED") {
      call.status = "COMPLETED";
      call.completed_at = new Date().toISOString();
      call.completed_by = staffName;
      const table = this.tables.find((t) => t.id === call.table_id);
      if (table) {
        table.status = "AVAILABLE";
        table.active_call_id = null;
        table.active_call_requested_at = null;
      }
      this.notify();
      return call;
    }
    return undefined;
  }

  addEvaluation(evaluation: Omit<Evaluation, "id" | "created_at">): Evaluation {
    const newEval: Evaluation = {
      ...evaluation,
      id: `eval-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.evaluations.unshift(newEval);
    this.notify();
    return newEval;
  }

  getEvaluations(): Evaluation[] {
    return [...this.evaluations];
  }
}

export const inMemoryStore = new InMemoryStore();
