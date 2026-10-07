-- Tenant authorization comes from stored profiles and server-controlled app metadata.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists active boolean not null default true;
alter table public.profiles add column if not exists sector text;
alter table public.restaurants add column if not exists logo_path text;
alter table public.restaurants add column if not exists cover_path text;
create or replace function private.platform_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u where u.id=auth.uid() and u.raw_app_meta_data->>'platform_admin'='true');
$$;
create or replace function private.can_access(unit uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.platform_admin() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.active and p.restaurant_id=unit));
$$;
create or replace function private.can_manage(unit uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.platform_admin() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.active and p.restaurant_id=unit and p.role in ('OWNER','MANAGER')));
$$;
revoke all on function private.platform_admin(),private.can_access(uuid),private.can_manage(uuid) from public;
grant execute on function private.platform_admin(),private.can_access(uuid),private.can_manage(uuid) to authenticated;
create table if not exists public.restaurant_settings(restaurant_id uuid primary key references public.restaurants(id) on delete cascade,floor_plan jsonb not null default '{"positions":[]}',updated_at timestamptz not null default now());
alter table public.restaurant_settings enable row level security;
grant select,insert,update on public.restaurant_settings to authenticated;
create policy workspace_read on public.restaurant_settings for select to authenticated using(private.can_access(restaurant_id));
create policy workspace_insert on public.restaurant_settings for insert to authenticated with check(private.can_manage(restaurant_id));
create policy workspace_update on public.restaurant_settings for update to authenticated using(private.can_manage(restaurant_id)) with check(private.can_manage(restaurant_id));
drop policy if exists "Sistema insere perfil no registro do usuário" on public.profiles;
drop policy if exists "Usuário pode atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Usuário pode visualizar perfis do mesmo restaurante" on public.profiles;
create policy staff_read on public.profiles for select to authenticated using(id=auth.uid() or private.can_access(restaurant_id));
create policy staff_update on public.profiles for update to authenticated using(id=auth.uid() or private.can_manage(restaurant_id)) with check(id=auth.uid() or private.can_manage(restaurant_id));
create or replace function private.guard_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return new; end if;
 if private.platform_admin() then return new; end if;
 if new.restaurant_id is distinct from old.restaurant_id then raise exception 'Estabelecimento não pode ser alterado'; end if;
 if (new.role is distinct from old.role or new.active is distinct from old.active or new.sector is distinct from old.sector) and not private.can_manage(old.restaurant_id) then raise exception 'Sem permissão para alterar acesso'; end if;
 if new.role='OWNER' and new.role is distinct from old.role and not exists(select 1 from public.profiles where id=auth.uid() and role='OWNER' and active) then raise exception 'Somente administrador pode atribuir este papel'; end if;
 return new;
end; $$;
revoke all on function private.guard_profile() from public;
create trigger protect_profile before update on public.profiles for each row execute function private.guard_profile();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,restaurant_id,name,role,active) values(new.id,nullif(new.raw_app_meta_data->>'restaurant_id','')::uuid,coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Usuário'),coalesce(nullif(new.raw_app_meta_data->>'role','')::public.user_role,'WAITER'),coalesce(new.raw_app_meta_data->>'platform_admin','false')='true' or new.raw_app_meta_data->>'restaurant_id' is not null) on conflict(id) do nothing;
 return new;
end; $$;
revoke all on function public.handle_new_user() from public;
create policy restaurant_management on public.restaurants for update to authenticated using(private.can_manage(id)) with check(private.can_manage(id));
create policy restaurant_creation on public.restaurants for insert to authenticated with check(private.platform_admin());
create policy platform_restaurants on public.restaurants for select to authenticated using(private.platform_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('restaurant-brand','restaurant-brand',true,2097152,array['image/jpeg','image/png','image/webp']),('staff-photos','staff-photos',false,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy branding_upload on storage.objects for insert to authenticated with check(bucket_id='restaurant-brand' and private.can_manage(((storage.foldername(name))[1])::uuid));
create policy staff_photo_read on storage.objects for select to authenticated using(bucket_id='staff-photos' and private.can_access(((storage.foldername(name))[1])::uuid));
create policy staff_photo_upload on storage.objects for insert to authenticated with check(bucket_id='staff-photos' and private.can_access(((storage.foldername(name))[1])::uuid) and ((storage.foldername(name))[2]=auth.uid()::text or private.can_manage(((storage.foldername(name))[1])::uuid)));
