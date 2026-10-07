-- Every write is rolled back. Run with project administrator privileges.
begin;
create temporary table ops_fixture as select gen_random_uuid() unit,gen_random_uuid() seat,gen_random_uuid() event_key;
grant select on ops_fixture to authenticated,anon;
insert into public.restaurants(id,name,slug) select unit,'Teste transacional','ops-'||unit from ops_fixture;
insert into public.tables(id,restaurant_id,number,status) select seat,unit,'01','AVAILABLE' from ops_fixture;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where username='aurora.garcom1'),true);
set local role authenticated;
do $$ declare seat uuid; begin
 select id into seat from public.tables limit 1;
 perform public.add_table_note(seat,'Observação transacional');
 if not exists(select 1 from public.table_notes where table_id=seat and author_id=auth.uid()) then raise exception 'Note missing'; end if;
 begin update public.tables set priority=true where id=seat;raise exception 'Waiter priority accepted';exception when others then if SQLERRM='Waiter priority accepted' then raise;end if;end;
 begin perform public.add_table_note((select seat from ops_fixture),'Foreign note');raise exception 'Foreign note accepted';exception when others then if SQLERRM='Foreign note accepted' then raise;end if;end;
 if exists(select 1 from public.activity_logs where actor_id is distinct from auth.uid()) then raise exception 'Other staff logs exposed';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from auth.users where email='vexadmin@mesaconnect.com'),true);
set local role authenticated;
do $$ declare creds jsonb; first jsonb; again jsonb; target uuid; key uuid; report jsonb; begin
 select seat,event_key into target,key from ops_fixture;
 creds:=public.pair_table_device(target);
 first:=public.device_gateway(creds->>'device_uid',creds->>'token','CALL',key);
 if first->>'table_status'<>'CALLING' then raise exception 'CALL state absent';end if;
 update public.service_calls set status='ACKNOWLEDGED' where id=(first->>'call_id')::uuid;
 again:=public.device_gateway(creds->>'device_uid',creds->>'token','CALL',key);
 if again->>'table_status'<>'ACKNOWLEDGED' then raise exception 'Current LED state absent';end if;
 update public.service_calls set status='COMPLETED' where id=(first->>'call_id')::uuid;
 again:=public.device_gateway(creds->>'device_uid',creds->>'token','CALL',key);
 if first->>'call_id' is distinct from again->>'call_id' or again->>'table_status'<>'AVAILABLE' then raise exception 'Completed replay generated another call';end if;
 if (select count(*) from public.service_calls where table_id=target)<>1 then raise exception 'Receipt dedup failed';end if;
 if (select device_last_seen from public.tables where id=target) is null then raise exception 'Heartbeat missing';end if;
 begin perform public.device_gateway(creds->>'device_uid',repeat('0',64),'CALL',key);raise exception 'Bad token accepted';exception when others then if SQLERRM='Bad token accepted' then raise;end if;end;
 report:=public.operational_report((select unit from ops_fixture));
 if (report->>'total')::integer<>1 or (report->>'completed')::integer<>1 then raise exception 'Report count wrong';end if;
end $$;
select 'PASS: notes, waiter permissions, immutable logs, device replay after completion, LED states, heartbeat, token rejection and full reports' as result;
rollback;

-- Google link validation, including PostgreSQL-compatible regex bounds.
begin;
update public.restaurants set google_review_url='https://www.google.com/maps' where slug='aurora-demo';
do $$ begin if public.public_table('aurora-demo','01')->>'google_review_url'<>'https://www.google.com/maps' then raise exception 'Google URL not resolved';end if;begin update public.restaurants set google_review_url='https://evil.example/review' where slug='aurora-demo';raise exception 'Foreign URL accepted';exception when others then if SQLERRM='Foreign URL accepted' then raise;end if;end;end $$;
rollback;
