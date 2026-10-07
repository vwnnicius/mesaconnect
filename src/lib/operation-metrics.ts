import type { ServiceCall, Evaluation } from "@/types";
export function operationMetrics(
  calls: ServiceCall[],
  evaluations: Evaluation[],
) {
  const response = calls
    .filter((c) => c.acknowledged_at)
    .map((c) =>
      Math.max(
        0,
        (Date.parse(c.acknowledged_at!) - Date.parse(c.requested_at)) / 1000,
      ),
    )
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const durations = calls
    .filter((c) => c.completed_at && c.acknowledged_at)
    .map((c) =>
      Math.max(
        0,
        (Date.parse(c.completed_at!) - Date.parse(c.acknowledged_at!)) / 1000,
      ),
    )
    .filter(Number.isFinite);
  const mean = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const midpoint = Math.floor(response.length / 2);
  return {
    total: calls.length,
    completed: calls.filter((c) => c.status === "COMPLETED").length,
    response: mean(response),
    duration: mean(durations),
    median: response.length
      ? response.length % 2
        ? response[midpoint]
        : (response[midpoint - 1] + response[midpoint]) / 2
      : null,
    sla: response.length
      ? Math.round(
          (response.filter((n) => n <= 120).length / response.length) * 100,
        )
      : null,
    rating: evaluations.length
      ? evaluations.reduce((a, b) => a + b.rating, 0) / evaluations.length
      : null,
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      calls: calls.filter((c) => new Date(c.requested_at).getHours() === hour)
        .length,
    })),
  };
}
