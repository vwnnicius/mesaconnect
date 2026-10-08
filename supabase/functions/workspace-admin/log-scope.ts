export function logScope(body: Record<string, unknown>, now = Date.now()) {
  if (body.scope !== "all" && body.scope !== "unit")
    throw new Error("Escolha o alcance da limpeza.");
  const unit = body.scope === "unit" ? body.restaurant_id : null;
  if (
    body.scope === "unit" &&
    (typeof unit !== "string" ||
      !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(unit))
  )
    throw new Error("Estabelecimento inválido.");
  const phrase = unit
    ? "LIMPAR LOGS DESTE ESTABELECIMENTO"
    : "LIMPAR TODOS OS LOGS";
  if (body.action === "clear_logs") {
    const cutoff =
      typeof body.cutoff === "string" ? Date.parse(body.cutoff) : NaN;
    if (
      !Number.isFinite(cutoff) ||
      cutoff > now ||
      now - cutoff > 10 * 60 * 1000 ||
      body.confirmation !== phrase
    )
      throw new Error(
        "Confirme a limpeza novamente. A confirmação expira em 10 minutos.",
      );
  }
  return { unit, phrase };
}
