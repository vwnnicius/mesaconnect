-- Supabase's default grants may include explicit role grants, independently of PUBLIC.
revoke all on function public.handle_new_user(),public.sync_table_status_from_call() from anon,authenticated;
revoke all on function public.simulator_event(uuid,text),public.pair_table_device(uuid) from anon;
create or replace function public.current_user_restaurant_id() returns uuid language sql stable security definer set search_path='' as $$ select restaurant_id from public.profiles where id=auth.uid() and active limit 1; $$;
revoke all on function public.current_user_restaurant_id() from public,anon;
grant execute on function public.current_user_restaurant_id() to authenticated;
revoke all on function public.rls_auto_enable() from public,anon,authenticated;
