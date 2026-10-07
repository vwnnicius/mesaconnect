export function reportBounds(days: number, month?: string) {
  if (days === 0) return {};
  if (days === -1) {
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      throw new Error("Selecione um mês válido.");
    const [year, m] = month.split("-").map(Number);
    return {
      started: new Date(
        `${year}-${String(m).padStart(2, "0")}-01T00:00:00-03:00`,
      ).toISOString(),
      ended: new Date(
        `${m === 12 ? year + 1 : year}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01T00:00:00-03:00`,
      ).toISOString(),
    };
  }
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days + 1);
  return { started: since.toISOString() };
}
