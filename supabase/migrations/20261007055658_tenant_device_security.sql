-- Replace prototype public write access with tenant policies and narrow authenticated gateways.
do $$ declare p record; begin for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('tables','devices','device_events','service_calls','evaluations') loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop; end $$;
create policy tenant_tables_read on public.tables for select to authenticated using(private.can_access(restaurant_id));
create policy tenant_tables_update on public.tables for update to authenticated using(private.can_access(restaurant_id)) with check(private.can_access(restaurant_id));
create policy tenant_calls_read on public.service_calls for select to authenticated using(private.can_access(restaurant_id));
create policy tenant_calls_insert on public.service_calls for insert to authenticated with check(private.can_access(restaurant_id) and exists(select 1 from public.tables t where t.id=table_id and t.restaurant_id=service_calls.restaurant_id));
create policy tenant_calls_update on public.service_calls for update to authenticated using(private.can_access(restaurant_id) and (status='CALLING' or acknowledged_by=auth.uid() or private.can_manage(restaurant_id))) with check(private.can_access(restaurant_id));
create policy tenant_evaluations_read on public.evaluations for select to authenticated using(private.can_manage(restaurant_id));
create policy tenant_devices_read on public.devices for select to authenticated using(exists(select 1 from public.tables t where t.id=table_id and private.can_access(t.restaurant_id)));
create policy tenant_devices_update on public.devices for update to authenticated using(exists(select 1 from public.tables t where t.id=table_id and private.can_manage(t.restaurant_id))) with check(exists(select 1 from public.tables t where t.id=table_id and private.can_manage(t.restaurant_id)));
create policy tenant_events_read on public.device_events for select to authenticated using(exists(select 1 from public.tables t where t.id=table_id and private.can_manage(t.restaurant_id)));
create table private.device_credentials(device_id uuid primary key references public.devices(id) on delete cascade,token_hash text not null,created_at timestamptz not null default now());
alter table private.device_credentials enable row level security;
revoke all on private.device_credentials from public,anon,authenticated;
create or replace function private.apply_table_event(target uuid,event text,origin text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.tables; c uuid; begin
 select * into t from public.tables where id=target for update;
 if not found then raise exception 'Mesa não encontrada'; end if;
 if event='CALL' then
  select id into c from public.service_calls where table_id=target and status in ('CALLING','ACKNOWLEDGED') order by requested_at limit 1;
  if c is null then insert into public.service_calls(restaurant_id,table_id,status,requested_by,requested_at) values(t.restaurant_id,t.id,'CALLING',origin,now()) returning id into c; end if;
 elsif event in ('RESET','DO_NOT_DISTURB') then
  if exists(select 1 from public.service_calls where table_id=target and status in ('CALLING','ACKNOWLEDGED')) then raise exception 'Conclua o atendimento ativo antes de alterar a mesa'; end if;
  update public.tables set status=case when event='RESET' then 'AVAILABLE'::public.table_status else 'DO_NOT_DISTURB'::public.table_status end where id=target;
 elsif event<>'HEARTBEAT' then raise exception 'Evento inválido'; end if;
 return jsonb_build_object('success',true,'table_id',t.id,'table_number',t.number,'call_id',c,'message','Evento registrado');
end; $$;
revoke all on function private.apply_table_event(uuid,text,text) from public;
create or replace function public.simulator_event(target uuid,event text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.tables where id=target and private.can_manage(restaurant_id)) then raise exception 'Sem permissão para simular nesta mesa'; end if;
 return private.apply_table_event(target,event,'SIMULATOR');
end; $$;
revoke all on function public.simulator_event(uuid,text) from public;
grant execute on function public.simulator_event(uuid,text) to authenticated;
create or replace function public.pair_table_device(target uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.tables; d uuid; uid text; secret text; begin
 select * into t from public.tables where id=target for update;
 if not found or not private.can_manage(t.restaurant_id) then raise exception 'Sem permissão'; end if;
 select id,device_uid into d,uid from public.devices where table_id=target limit 1;
 if d is null then uid:='MC-'||gen_random_uuid()::text; insert into public.devices(table_id,device_uid,online) values(target,uid,false) returning id into d; end if;
 secret:=encode(extensions.gen_random_bytes(32),'hex');
 insert into private.device_credentials(device_id,token_hash) values(d,encode(extensions.digest(secret,'sha256'),'hex')) on conflict(device_id) do update set token_hash=excluded.token_hash,created_at=now();
 update public.tables set device_id=d where id=target;
 return jsonb_build_object('device_uid',uid,'token',secret);
end; $$;
revoke all on function public.pair_table_device(uuid) from public;
grant execute on function public.pair_table_device(uuid) to authenticated;
create or replace function public.device_gateway(uid text,token text,event text) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.devices; result jsonb; begin
 if length(coalesce(token,''))<>64 or length(coalesce(uid,''))>100 then raise exception 'Dispositivo não autorizado'; end if;
 select dev.* into d from public.devices dev join private.device_credentials c on c.device_id=dev.id where dev.device_uid=uid and c.token_hash=encode(extensions.digest(token,'sha256'),'hex') for update of dev;
 if not found then raise exception 'Dispositivo não autorizado'; end if;
 if d.last_seen>now()-interval '500 milliseconds' then raise exception 'Aguarde antes do próximo evento'; end if;
 result:=private.apply_table_event(d.table_id,event,'DEVICE_'||uid);
 update public.devices set online=true,last_seen=now() where id=d.id;
 insert into public.device_events(device_id,table_id,event_type,payload) values(d.id,d.table_id,event,'{}'::jsonb);
 return result;
end; $$;
revoke all on function public.device_gateway(text,text,text) from public;
grant execute on function public.device_gateway(text,text,text) to anon,authenticated;
create or replace function public.public_table(unit_slug text,table_number text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',t.id,'restaurant_id',r.id,'number',t.number,'restaurant_name',r.name,'logo_path',r.logo_path,'cover_path',r.cover_path) from public.tables t join public.restaurants r on r.id=t.restaurant_id where r.slug=unit_slug and t.number=table_number limit 1;
$$;
revoke all on function public.public_table(text,text) from public;
grant execute on function public.public_table(text,text) to anon,authenticated;
create or replace function public.submit_evaluation(target uuid,score int,note text) returns uuid language plpgsql security definer set search_path='' as $$
declare unit uuid; result uuid; begin
 if score is null or score<1 or score>5 or length(coalesce(note,''))>500 then raise exception 'Avaliação inválida'; end if;
 select restaurant_id into unit from public.tables where id=target;
 if unit is null then raise exception 'Mesa não encontrada'; end if;
 insert into public.evaluations(restaurant_id,table_id,rating,comment) values(unit,target,score,nullif(trim(note),'')) returning id into result;
 return result;
end; $$;
revoke all on function public.submit_evaluation(uuid,int,text) from public;
grant execute on function public.submit_evaluation(uuid,int,text) to anon,authenticated;
create or replace function private.guard_call() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.table_id<>old.table_id or new.restaurant_id<>old.restaurant_id or new.requested_at<>old.requested_at or new.requested_by is distinct from old.requested_by then raise exception 'Identidade do chamado não pode ser alterada'; end if;
  if not ((old.status='CALLING' and new.status='ACKNOWLEDGED') or (old.status='ACKNOWLEDGED' and new.status='COMPLETED')) then raise exception 'Transição inválida'; end if;
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  if new.status='ACKNOWLEDGED' then new.acknowledged_by:=auth.uid();new.acknowledged_at:=now();new.completed_by:=null;new.completed_at:=null;
  else new.acknowledged_by:=old.acknowledged_by;new.acknowledged_at:=old.acknowledged_at;new.completed_by:=auth.uid();new.completed_at:=now(); end if;
 else
  if new.status<>'CALLING' then raise exception 'Chamado deve começar aguardando'; end if;
  perform 1 from public.tables where id=new.table_id and restaurant_id=new.restaurant_id for update;
  if not found then raise exception 'Mesa e estabelecimento incompatíveis'; end if;
  if exists(select 1 from public.service_calls where table_id=new.table_id and status in ('CALLING','ACKNOWLEDGED')) then raise exception 'Esta mesa já tem um chamado ativo'; end if;
  new.requested_at:=now();new.acknowledged_at:=null;new.acknowledged_by:=null;new.completed_at:=null;new.completed_by:=null;
 end if;
 return new;
end; $$;
revoke all on function private.guard_call() from public;
create trigger protect_call before insert or update on public.service_calls for each row execute function private.guard_call();
create or replace function public.sync_table_status_from_call() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.tables set status=case new.status when 'CALLING' then 'CALLING'::public.table_status when 'ACKNOWLEDGED' then 'ACKNOWLEDGED'::public.table_status else 'AVAILABLE'::public.table_status end where id=new.table_id;return new;end;$$;
revoke all on function public.sync_table_status_from_call() from public;
