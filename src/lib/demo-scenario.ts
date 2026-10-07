/** Isolated presentation state. Never imports database clients or production services. */
export type DemoStatus = 'AVAILABLE' | 'CALLING' | 'ACKNOWLEDGED' | 'COMPLETED';
export interface DemoTable {
  number: string;
  status: DemoStatus;
  connected: boolean;
  requestedAt: number | null;
  acknowledgedAt: number | null;
  completedAt: number | null;
  rating: number | null;
}
export interface DemoState {
  selected: string;
  tables: DemoTable[];
  events: { id: number; table: string; message: string; at: number }[];
  sequence: number;
}
export type DemoAction =
  | { type: 'RESET' }
  | { type: 'SELECT'; table: string }
  | { type: 'CONNECTION'; table: string; at: number }
  | { type: 'CALL' | 'ACKNOWLEDGE' | 'COMPLETE'; table: string; at: number }
  | { type: 'RATE'; table: string; rating: number; at: number };

export function initialDemoState(): DemoState {
  return {
    selected: '07', sequence: 0, events: [],
    tables: Array.from({ length: 12 }, (_, i) => ({
      number: String(i + 1).padStart(2, '0'), status: 'AVAILABLE', connected: true,
      requestedAt: null, acknowledgedAt: null, completedAt: null, rating: null,
    })),
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'RESET') return initialDemoState();
  const table = state.tables.find((item) => item.number === action.table);
  if (!table) return state;
  if (action.type === 'SELECT') return { ...state, selected: table.number };
  let updated = { ...table };
  let message: string;
  switch (action.type) {
    case 'CALL':
      if (!table.connected || !['AVAILABLE', 'COMPLETED'].includes(table.status)) return state;
      updated = { ...table, status: 'CALLING', requestedAt: action.at, acknowledgedAt: null, completedAt: null, rating: null };
      message = 'Cliente solicitou atendimento';
      break;
    case 'ACKNOWLEDGE':
      if (table.status !== 'CALLING') return state;
      updated = { ...table, status: 'ACKNOWLEDGED', acknowledgedAt: action.at };
      message = 'Ana assumiu o chamado';
      break;
    case 'COMPLETE':
      if (table.status !== 'ACKNOWLEDGED') return state;
      updated = { ...table, status: 'COMPLETED', completedAt: action.at };
      message = 'Ana concluiu o atendimento';
      break;
    case 'RATE':
      if (table.status !== 'COMPLETED' || table.rating !== null || !Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5) return state;
      updated = { ...table, rating: action.rating };
      message = `Cliente avaliou com ${action.rating} ${action.rating === 1 ? 'estrela' : 'estrelas'}`;
      break;
    case 'CONNECTION':
      updated = { ...table, connected: !table.connected };
      message = updated.connected ? 'Conexão do botão restabelecida' : 'Botão ficou sem conexão';
      break;
  }
  const id = state.sequence + 1;
  return { ...state, sequence: id, tables: state.tables.map((item) => item.number === table.number ? updated : item), events: [{ id, table: table.number, message, at: action.at }, ...state.events].slice(0, 20) };
}

export function demoStep(table: DemoTable): number {
  if (table.rating !== null) return 4;
  return { AVAILABLE: 0, CALLING: 1, ACKNOWLEDGED: 2, COMPLETED: 3 }[table.status];
}
