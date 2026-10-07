import { Table, ServiceCall, Evaluation, DashboardMetrics } from '@/types';
import { RESTAURANT_DEMO } from './constants';

/**
 * ==============================================================================
 * DADOS DE DEMONSTRAÇÃO (DEMO DATA)
 * ==============================================================================
 * NOTA: Estes dados são utilizados como fallback para demonstração e testes locais
 * antes ou durante a sincronização com o banco Supabase ao vivo.
 * Identificação clara: Todos os itens abaixo são puramente demonstrativos.
 * ==============================================================================
 */
export const IS_DEMO_DATA_ACTIVE = true;

const now = Date.now();

export const INITIAL_DEMO_TABLES: Table[] = [
  {
    id: 'demo-table-01',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '01',
    device_id: 'demo-device-01',
    status: 'AVAILABLE',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-02',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '02',
    device_id: 'demo-device-02',
    status: 'AVAILABLE',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-03',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '03',
    device_id: 'demo-device-03',
    status: 'AVAILABLE',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-04',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '04',
    device_id: 'demo-device-04',
    status: 'CALLING',
    active_call_id: 'demo-call-04',
    active_call_requested_at: new Date(now - 130000).toISOString(), // ~2m10s atrás
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-05',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '05',
    device_id: 'demo-device-05',
    status: 'DO_NOT_DISTURB',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-06',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '06',
    device_id: 'demo-device-06',
    status: 'AVAILABLE',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-07',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '07',
    device_id: 'demo-device-07',
    status: 'CALLING',
    active_call_id: 'demo-call-07',
    active_call_requested_at: new Date(now - 45000).toISOString(), // ~45s atrás
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-08',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '08',
    device_id: 'demo-device-08',
    status: 'ACKNOWLEDGED',
    active_call_id: 'demo-call-08',
    active_call_requested_at: new Date(now - 190000).toISOString(),
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-09',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '09',
    device_id: 'demo-device-09',
    status: 'AVAILABLE',
    created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'demo-table-10',
    restaurant_id: RESTAURANT_DEMO.id,
    number: '10',
    device_id: 'demo-device-10',
    status: 'OFFLINE',
    created_at: new Date(now - 86400000).toISOString(),
  },
];

export const INITIAL_DEMO_CALLS: ServiceCall[] = [
  {
    id: 'demo-call-04',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-04',
    table_number: '04',
    requested_at: new Date(now - 130000).toISOString(),
    acknowledged_at: null,
    completed_at: null,
    status: 'CALLING',
    requested_by: 'CLIENT_BUTTON',
    acknowledged_by: null,
    completed_by: null,
    created_at: new Date(now - 130000).toISOString(),
  },
  {
    id: 'demo-call-07',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-07',
    table_number: '07',
    requested_at: new Date(now - 45000).toISOString(),
    acknowledged_at: null,
    completed_at: null,
    status: 'CALLING',
    requested_by: 'CLIENT_BUTTON',
    acknowledged_by: null,
    completed_by: null,
    created_at: new Date(now - 45000).toISOString(),
  },
  {
    id: 'demo-call-08',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-08',
    table_number: '08',
    requested_at: new Date(now - 190000).toISOString(),
    acknowledged_at: new Date(now - 60000).toISOString(),
    completed_at: null,
    status: 'ACKNOWLEDGED',
    requested_by: 'CLIENT_BUTTON',
    acknowledged_by: 'demo-staff-joao',
    completed_by: null,
    created_at: new Date(now - 190000).toISOString(),
  },
  // Históricos concluídos hoje
  {
    id: 'demo-call-hist-01',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-01',
    table_number: '01',
    requested_at: new Date(now - 14400000).toISOString(),
    acknowledged_at: new Date(now - 14350000).toISOString(),
    completed_at: new Date(now - 14100000).toISOString(),
    status: 'COMPLETED',
    requested_by: 'CLIENT_BUTTON',
    acknowledged_by: 'demo-staff-joao',
    completed_by: 'demo-staff-joao',
    created_at: new Date(now - 14400000).toISOString(),
  },
  {
    id: 'demo-call-hist-02',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-02',
    table_number: '02',
    requested_at: new Date(now - 10800000).toISOString(),
    acknowledged_at: new Date(now - 10740000).toISOString(),
    completed_at: new Date(now - 10500000).toISOString(),
    status: 'COMPLETED',
    requested_by: 'CLIENT_BUTTON',
    acknowledged_by: 'demo-staff-joao',
    completed_by: 'demo-staff-joao',
    created_at: new Date(now - 10800000).toISOString(),
  },
];

export const INITIAL_DEMO_EVALUATIONS: Evaluation[] = [
  {
    id: 'demo-eval-01',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-01',
    table_number: '01',
    service_call_id: 'demo-call-hist-01',
    rating: 5,
    comment: 'Picanha sensacional e o garçom chegou em menos de 1 minuto! Muito prático.',
    created_at: new Date(now - 13800000).toISOString(),
  },
  {
    id: 'demo-eval-02',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-02',
    table_number: '02',
    service_call_id: 'demo-call-hist-02',
    rating: 5,
    comment: 'Atendimento impecável! O botão na mesa facilitou muito pedir bebidas.',
    created_at: new Date(now - 10200000).toISOString(),
  },
  {
    id: 'demo-eval-03',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-07',
    table_number: '07',
    service_call_id: null,
    rating: 4,
    comment: 'Muito ágil e sem constrangimento de ficar abanando a mão pro garçom.',
    created_at: new Date(now - 7200000).toISOString(),
  },
  {
    id: 'demo-eval-04',
    restaurant_id: RESTAURANT_DEMO.id,
    table_id: 'demo-table-03',
    table_number: '03',
    service_call_id: null,
    rating: 5,
    comment: 'Experiência excelente no rodízio. Nota 10!',
    created_at: new Date(now - 3600000).toISOString(),
  },
];

export const DEMO_DASHBOARD_METRICS: DashboardMetrics = {
  totalCallsToday: 127,
  openCalls: 3,
  avgResponseTimeSeconds: 74, // 01:14
  medianResponseTimeSeconds: 58, // 00:58
  avgServiceDurationSeconds: 312, // ~5 min
  totalEvaluations: 48,
  avgRating: 4.8,
  callingTablesCount: 2,
  totalTables: 10,
};

export const DEMO_HOURLY_CALLS = [
  { hour: '12:00', calls: 8 },
  { hour: '13:00', calls: 24 },
  { hour: '14:00', calls: 18 },
  { hour: '15:00', calls: 4 },
  { hour: '19:00', calls: 14 },
  { hour: '20:00', calls: 32 },
  { hour: '21:00', calls: 21 },
  { hour: '22:00', calls: 6 },
];

export const DEMO_CALLS_BY_TABLE = [
  { tableNumber: '01', calls: 12 },
  { tableNumber: '02', calls: 9 },
  { tableNumber: '03', calls: 15 },
  { tableNumber: '04', calls: 22 },
  { tableNumber: '05', calls: 8 },
  { tableNumber: '06', calls: 14 },
  { tableNumber: '07', calls: 28 },
  { tableNumber: '08', calls: 11 },
  { tableNumber: '09', calls: 6 },
  { tableNumber: '10', calls: 2 },
];
