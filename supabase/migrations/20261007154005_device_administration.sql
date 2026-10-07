alter table public.tables add column device_last_seen timestamptz;
create table private.device_receipts(device_id uuid not null references public.devices(id),event_key uuid not null,event_type text not null,result jsonb not null,created_at timestamptz not null default now(),primary key(device_id,event_key));
alter table private.device_receipts enable row level security;
revoke all on private.device_receipts from public,anon,authenticated;
drop policy tenant_devices_read on public.devices;
drop policy tenant_devices_update on public.devices;
create policy platform_devices_read on public.devices for select to authenticated using(private.platform_admin());
create policy platform_devices_update on public.devices for update to authenticated using(private.platform_admin()) with check(private.platform_admin());
create function private.guard_device_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.device_id is distinct from old.device_id and not private.platform_admin() and auth.uid() is not null then raise exception 'Somente administrador geral configura dispositivos'; end if;
 return new;
end; $$;
revoke all on function private.guard_device_assignment() from public,anon,authenticated;
create trigger protect_device_assignment before update on public.tables for each row execute function private.guard_device_assignment();
drop function public.device_gateway(text,text,text);
create function public.device_gateway(uid text,token text,event text,event_key uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.devices; response jsonb; receipt private.device_receipts; t public.tables;
begin
 if length(coalesce(token,''))<>64 or length(coalesce(uid,''))>100 then raise exception 'Dispositivo não autorizado'; end if;
 select dev.* into d from public.devices dev join private.device_credentials c on c.device_id=dev.id where dev.device_uid=uid and c.token_hash=encode(extensions.digest(token,'sha256'),'hex') for update of dev;
 if not found or d.table_id is null then raise exception 'Dispositivo não autorizado'; end if;
 if event_key is not null then select * into receipt from private.device_receipts r where r.device_id=d.id and r.event_key=device_gateway.event_key; end if;
 if receipt.event_key is not null then
  if receipt.event_type<>event then raise exception 'Evento incompatível'; end if;
  response:=receipt.result;
 else
  if d.last_seen>now()-interval '500 milliseconds' then raise exception 'Aguarde antes do próximo evento'; end if;
  response:=private.apply_table_event(d.table_id,event,'DEVICE_'||uid);
  if event_key is not null then insert into private.device_receipts(device_id,event_key,event_type,result) values(d.id,event_key,event,response); end if;
  insert into public.device_events(device_id,table_id,event_type,payload) values(d.id,d.table_id,event,jsonb_build_object('event_id',event_key));
 end if;
 update public.devices set online=true,last_seen=now() where id=d.id;
 update public.tables set device_last_seen=now() where id=d.table_id;
 select * into t from public.tables where id=d.table_id;
 return response||jsonb_build_object('table_status',t.status,'priority',t.priority);
end; $$;
revoke all on function public.device_gateway(text,text,text,uuid) from public;
grant execute on function public.device_gateway(text,text,text,uuid) to anon,authenticated;
