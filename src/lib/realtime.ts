import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
export type LiveStatus = "connecting" | "live" | "recovering";
export function subscribeTableChanges(
  table: string,
  filter: string,
  onChange: () => void,
  onStatus?: (status: LiveStatus) => void,
): () => void {
  if (!isSupabaseConfigured()) return () => {};
  const supabase = createClient();
  let disposed = false;
  onStatus?.("connecting");
  const channel = supabase
    .channel(table + ":" + filter + ":" + crypto.randomUUID())
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter },
      () => {
        if (!disposed) onChange();
      },
    );
  const resume = () => {
    if (!disposed && document.visibilityState !== "hidden") onChange();
  };
  // Recover snapshots lost between initial fetch and subscription, and after reconnect.
  channel.subscribe((status) => {
    if (disposed) return;
    onStatus?.(
      status === "SUBSCRIBED"
        ? "live"
        : status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ? "recovering"
          : "connecting",
    );
    if (status === "SUBSCRIBED") onChange();
  });
  const timer = window.setInterval(resume, 10000);
  window.addEventListener("online", resume);
  window.addEventListener("focus", resume);
  document.addEventListener("visibilitychange", resume);
  return () => {
    disposed = true;
    clearInterval(timer);
    window.removeEventListener("online", resume);
    window.removeEventListener("focus", resume);
    document.removeEventListener("visibilitychange", resume);
    void supabase.removeChannel(channel);
  };
}
