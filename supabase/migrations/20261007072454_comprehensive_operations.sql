alter table public.restaurants add column google_review_url text;
alter table public.restaurants add constraint google_review_url_safe check(google_review_url is null or google_review_url ~ '^https://(search[.]google[.]com|maps[.]google[.]com|www[.]google[.]com|g[.]page|maps[.]app[.]goo[.]gl)/[^[:space:]]{1,1800}$');
alter table public.profiles add column username text unique;
alter table public.profiles add constraint username_valid check(username is null or username ~ '^[a-z0-9][a-z0-9._-]{2,59}$');
alter table public.tables add column priority boolean not null default false;
create table public.table_notes(id uuid primary key default gen_random_uuid(),restaurant_id uuid not null references public.restaurants(id),table_id uuid not null references public.tables(id),author_id uuid not null references public.profiles(id),content text not null check(length(trim(content)) between 1 and 1000),created_at timestamptz not null default now());
create index notes_unit_table_time on public.table_notes(restaurant_id,table_id,created_at desc);
alter table public.table_notes enable row level security;
create policy notes_read on public.table_notes for select to authenticated using(private.can_access(restaurant_id));
grant select on public.table_notes to authenticated;
revoke insert,update,delete on public.table_notes from anon,authenticated;
create table public.activity_logs(id uuid primary key default gen_random_uuid(),restaurant_id uuid not null references public.restaurants(id),actor_id uuid references public.profiles(id),table_id uuid references public.tables(id),action text not null,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index logs_unit_time on public.activity_logs(restaurant_id,created_at desc);
alter table public.activity_logs enable row level security;
create policy logs_read on public.activity_logs for select to authenticated using(private.can_manage(restaurant_id) or (private.can_access(restaurant_id) and actor_id=auth.uid()));
grant select on public.activity_logs to authenticated;
revoke insert,update,delete on public.activity_logs from anon,authenticated;

create function public.add_table_note(target uuid,note text) returns uuid language plpgsql security definer set search_path='' as $$
declare t public.tables; result uuid;
begin
 select * into t from public.tables where id=target;
 if t.id is null or not private.can_access(t.restaurant_id) then raise exception 'Sem permissão'; end if;
 if length(trim(coalesce(note,''))) not between 1 and 1000 then raise exception 'Observação deve ter de 1 a 1.000 caracteres'; end if;
 insert into public.table_notes(restaurant_id,table_id,author_id,content) values(t.restaurant_id,t.id,auth.uid(),trim(note)) returning id into result;
 insert into public.activity_logs(restaurant_id,actor_id,table_id,action) values(t.restaurant_id,auth.uid(),t.id,'NOTE_ADDED');
 return result;
end; $$;
revoke all on function public.add_table_note(uuid,text) from public,anon;
grant execute on function public.add_table_note(uuid,text) to authenticated;

create function private.log_operational_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='service_calls' then
  if tg_op='INSERT' or new.status is distinct from old.status then
   insert into public.activity_logs(restaurant_id,actor_id,table_id,action,details) values(new.restaurant_id,auth.uid(),new.table_id,'CALL_'||new.status::text,jsonb_build_object('call_id',new.id));
  end if;
 elsif tg_table_name='tables' and new.priority is distinct from old.priority then
  if auth.uid() is not null and not private.can_manage(new.restaurant_id) then raise exception 'Somente a gestão pode definir prioridade'; end if;
  insert into public.activity_logs(restaurant_id,actor_id,table_id,action,details) values(new.restaurant_id,auth.uid(),new.id,'PRIORITY_CHANGED',jsonb_build_object('priority',new.priority));
 end if;
 return new;
end; $$;
revoke all on function private.log_operational_change() from public,anon,authenticated;
create trigger audit_calls after insert or update on public.service_calls for each row execute function private.log_operational_change();
create trigger audit_priority after update on public.tables for each row execute function private.log_operational_change();

create function private.guard_staff_access() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or private.platform_admin() then return new; end if;
 if new.username is distinct from old.username then raise exception 'Login não pode ser alterado pelo perfil'; end if;
 if auth.uid()<>old.id and exists(select 1 from public.profiles where id=auth.uid() and role='MANAGER') and (old.role<>'WAITER' or new.role<>'WAITER') then raise exception 'Gerentes gerenciam apenas garçons'; end if;
 return new;
end; $$;
revoke all on function private.guard_staff_access() from public,anon,authenticated;
create trigger protect_staff_access before update on public.profiles for each row execute function private.guard_staff_access();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,restaurant_id,name,role,active,username) values(new.id,nullif(new.raw_app_meta_data->>'restaurant_id','')::uuid,coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Usuário'),coalesce(nullif(new.raw_app_meta_data->>'role','')::public.user_role,'WAITER'),coalesce(new.raw_app_meta_data->>'platform_admin','false')='true' or new.raw_app_meta_data->>'restaurant_id' is not null,nullif(new.raw_app_meta_data->>'username','')) on conflict(id) do nothing;
 return new;
end; $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;

create or replace function public.pair_table_device(target uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.tables; d uuid; uid text; secret text;
begin
 if not private.platform_admin() then raise exception 'Somente administrador geral configura dispositivos'; end if;
 select * into t from public.tables where id=target for update;
 if not found then raise exception 'Mesa não encontrada'; end if;
 select id,device_uid into d,uid from public.devices where table_id=target limit 1;
 if d is null then uid:='MC-'||gen_random_uuid()::text; insert into public.devices(table_id,device_uid,online) values(target,uid,false) returning id into d; end if;
 secret:=encode(extensions.gen_random_bytes(32),'hex');
 insert into private.device_credentials(device_id,token_hash) values(d,encode(extensions.digest(secret,'sha256'),'hex')) on conflict(device_id) do update set token_hash=excluded.token_hash,created_at=now();
 update public.tables set device_id=d where id=target;
 return jsonb_build_object('device_uid',uid,'token',secret);
end; $$;
revoke all on function public.pair_table_device(uuid) from public,anon;
grant execute on function public.pair_table_device(uuid) to authenticated;
create or replace function public.public_table(unit_slug text,table_number text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',t.id,'restaurant_id',r.id,'number',t.number,'restaurant_name',r.name,'logo_path',r.logo_path,'cover_path',r.cover_path,'google_review_url',r.google_review_url) from public.tables t join public.restaurants r on r.id=t.restaurant_id where r.slug=unit_slug and t.number=table_number limit 1;
$$;
revoke all on function public.public_table(text,text) from public;
grant execute on function public.public_table(text,text) to anon,authenticated;

create function public.operational_report(unit uuid,started timestamptz default null,ended timestamptz default null,employee uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not private.can_manage(unit) then raise exception 'Sem permissão'; end if;
 if employee is not null and not exists(select 1 from public.profiles where id=employee and restaurant_id=unit) then raise exception 'Funcionário inválido'; end if;
 if started is not null and ended is not null and ended<=started then raise exception 'Período inválido'; end if;
 with history as (
 select c.*,extract(epoch from (acknowledged_at-requested_at)) as response_seconds,extract(epoch from(completed_at-acknowledged_at)) as duration_seconds
 from public.service_calls c where c.restaurant_id=unit and (started is null or c.requested_at>=started) and (ended is null or c.requested_at<ended)
 ), scoped as(select * from history where employee is null or acknowledged_by=employee),
 feedback as(select e.* from public.evaluations e where e.restaurant_id=unit and (started is null or created_at>=started) and (ended is null or created_at<ended) and (employee is null or exists(select 1 from public.service_calls c where c.id=e.service_call_id and c.acknowledged_by=employee))),
 ranks as(
 select p.id,p.name,p.role,count(h.id) filter(where h.status='COMPLETED') as completed,count(h.id) as accepted,avg(h.response_seconds) as response,percentile_cont(0.5) within group(order by h.response_seconds) as median,round(100.0*count(h.id) filter(where h.response_seconds<=120)/nullif(count(h.id),0),1) as sla
 from public.profiles p left join history h on h.acknowledged_by=p.id where p.restaurant_id=unit and p.role='WAITER' group by p.id,p.name,p.role
 )
 select jsonb_build_object('total',(select count(*) from scoped),'completed',(select count(*) from scoped where status='COMPLETED'),'response',(select avg(response_seconds) from scoped),'median',(select percentile_cont(0.5) within group(order by response_seconds) from scoped),'duration',(select avg(duration_seconds) from scoped),'sla',(select round(100.0*count(*) filter(where response_seconds<=120)/nullif(count(response_seconds),0),1) from scoped),'rating',(select avg(rating) from feedback),'feedback_count',(select count(*) from feedback),'hours',(select jsonb_agg(jsonb_build_object('hour',h,'calls',(select count(*) from scoped where extract(hour from requested_at at time zone 'America/Sao_Paulo')=h)) order by h) from generate_series(0,23) h),'ranks',(select coalesce(jsonb_agg(to_jsonb(r) order by (accepted>=3) desc,sla desc nulls last,median asc nulls last,completed desc,name),'[]'::jsonb) from ranks r)) into result;
 return result;
end; $$;
revoke all on function public.operational_report(uuid,timestamptz,timestamptz,uuid) from public,anon;
grant execute on function public.operational_report(uuid,timestamptz,timestamptz,uuid) to authenticated;
alter publication supabase_realtime add table public.table_notes,public.activity_logs;
