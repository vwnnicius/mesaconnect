import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function subscribeTableChanges(
  table: string,
  filter: string,
  onChange: () => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const supabase = createClient();
  const channelName = `${table}:${filter}:${crypto.randomUUID()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
