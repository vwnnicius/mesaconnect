create or replace function private.platform_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u join public.profiles p on p.id=u.id where u.id=auth.uid() and p.active and u.raw_app_meta_data->>'platform_admin'='true');
$$;
create or replace function private.guard_table() returns trigger language plpgsql security definer set search_path='' as $$
declare current_state public.service_calls.status%type;
begin
 if new.restaurant_id is distinct from old.restaurant_id or new.number is distinct from old.number then raise exception 'Identidade da mesa não pode ser alterada'; end if;
 select status into current_state from public.service_calls where table_id=new.id and status in ('CALLING','ACKNOWLEDGED') order by requested_at limit 1;
 if current_state is not null and new.status::text<>current_state::text then raise exception 'Conclua o chamado antes de alterar o estado da mesa'; end if;
 return new;
end; $$;
revoke all on function private.guard_table() from public,anon,authenticated;
create trigger protect_table before update on public.tables for each row execute function private.guard_table();
-- Reconcile statuses left inconsistent by the original multi-write prototype.
update public.tables t set status=c.status::text::public.table_status from public.service_calls c where c.table_id=t.id and c.status in ('CALLING','ACKNOWLEDGED') and t.status::text<>c.status::text;
create or replace function private.guard_owner() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null and not private.platform_admin() and old.role='OWNER' and not exists(select 1 from public.profiles where id=auth.uid() and role='OWNER' and active) then raise exception 'Somente um administrador pode editar outro administrador'; end if;
 return new;
end; $$;
revoke all on function private.guard_owner() from public,anon,authenticated;
create trigger protect_owner before update on public.profiles for each row execute function private.guard_owner();
