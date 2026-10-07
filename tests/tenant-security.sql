-- Run as project administrator. Every fixture and write is rolled back.
begin;
create temporary table verification_fixture as select gen_random_uuid() as unit,gen_random_uuid() as seat;
grant select on verification_fixture to authenticated,anon;
insert into public.restaurants(id,name,slug) select unit,'Verificação temporária','verification-'||unit::text from verification_fixture;
insert into public.tables(id,restaurant_id,number,status) select seat,unit,'01','AVAILABLE' from verification_fixture;
select set_config('request.jwt.claim.sub',(select id::text from auth.users where email='vexadmin@mesaconnect.com'),true);
set local role authenticated;
do $$ declare target uuid; first jsonb; again jsonb; creds jsonb; begin
 select seat into target from verification_fixture;
 first:=public.simulator_event(target,'CALL');again:=public.simulator_event(target,'CALL');
 if first->>'call_id' is distinct from again->>'call_id' then raise exception 'Duplicate call';end if;
 begin perform public.simulator_event(target,'RESET');raise exception 'Active reset accepted'; exception when others then if SQLERRM='Active reset accepted' then raise;end if;end;
 update public.service_calls set status='ACKNOWLEDGED' where id=(first->>'call_id')::uuid;
 update public.service_calls set status='COMPLETED' where id=(first->>'call_id')::uuid;
 if (select status from public.tables where id=target)<>'AVAILABLE' then raise exception 'Table not released';end if;
 creds:=public.pair_table_device(target);
 perform public.device_gateway(creds->>'device_uid',creds->>'token','HEARTBEAT');
 begin perform public.device_gateway(creds->>'device_uid',repeat('0',64),'CALL');raise exception 'Wrong credential accepted';exception when others then if SQLERRM='Wrong credential accepted' then raise;end if;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='WAITER' and active limit 1),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.tables where restaurant_id=(select unit from verification_fixture)) then raise exception 'Cross-tenant table visible';end if;
 if private.can_manage((select restaurant_id from public.profiles where id=auth.uid())) then raise exception 'Waiter elevated';end if;
 begin update public.profiles set role='OWNER' where id=auth.uid();raise exception 'Privilege escalation accepted';exception when others then if SQLERRM='Privilege escalation accepted' then raise;end if;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ declare target uuid; unit_slug text; begin
 if exists(select 1 from public.tables) or exists(select 1 from public.service_calls) or exists(select 1 from public.evaluations) then raise exception 'Public operational data exposed';end if;
 select seat,'verification-'||unit::text into target,unit_slug from verification_fixture;
 if public.public_table(unit_slug,'01')->>'number'<>'01' then raise exception 'Public QR cannot resolve';end if;
 if public.submit_evaluation(target,4,'Teste transacional') is null then raise exception 'Public evaluation failed';end if;
 if has_function_privilege('anon','public.pair_table_device(uuid)','execute') or has_function_privilege('anon','public.simulator_event(uuid,text)','execute') then raise exception 'Public management exposed';end if;
end $$;
select 'PASS: lifecycle, duplicate event, active reset, device authentication, tenant isolation, role protection and public QR' as verification;
rollback;
