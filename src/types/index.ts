export * from "./database";

export interface DashboardMetrics {
  totalCallsToday: number;
  openCalls: number;
  avgResponseTimeSeconds: number;
  medianResponseTimeSeconds: number;
  avgServiceDurationSeconds: number;
  totalEvaluations: number;
  avgRating: number;
  callingTablesCount: number;
  totalTables: number;
}

export interface HourlyCallsStat {
  hour: string;
  calls: number;
}

export interface TableCallsStat {
  tableNumber: string;
  calls: number;
}
