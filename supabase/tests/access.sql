begin;
create function public.mira_access_assert(p_condition boolean,p_label text) returns void
language plpgsql as $$ begin
  if p_condition is distinct from true then raise exception 'FAIL: %',p_label; end if;
  raise notice 'PASS: %',p_label;
end; $$;
grant execute on function public.mira_access_assert(boolean,text) to anon,authenticated;
insert into auth.users(id,email) values
 ('10000000-0000-0000-0000-000000000003','backend-admin@example.invalid'),
 ('10000000-0000-0000-0000-000000000004','backend-reader@example.invalid');
insert into mira_private.admin_members(user_id,role) values('10000000-0000-0000-0000-000000000003','owner');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select public.mira_access_assert(jsonb_array_length(public.load_shop_snapshot(false)->'orders')=0,'public snapshot has no renter records');
do $$ begin
  begin perform public.load_shop_snapshot(true);raise exception 'FAIL: anon admin read';
  exception when insufficient_privilege then raise notice 'PASS: anon cannot request admin snapshot';end;
end; $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000004',true);
select public.mira_access_assert(public.get_admin_access()->>'isAdmin'='false','ordinary user has no admin access');
select public.mira_access_assert(public.get_admin_access()->'role'='null'::jsonb,'ordinary user cannot learn other membership');
do $$ begin
  begin perform public.load_shop_snapshot(true);raise exception 'FAIL: ordinary admin read';
  exception when insufficient_privilege then raise notice 'PASS: ordinary user cannot request admin snapshot';end;
end; $$;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003',true);
select public.mira_access_assert(public.get_admin_access()->>'isAdmin'='true','active member has admin access');
select public.mira_access_assert(public.get_admin_access()->>'role'='owner','self-access returns own role');
select public.mira_access_assert(jsonb_array_length(public.load_shop_snapshot(true)->'orders')=(select count(*) from public.rental_orders),'admin snapshot returns authorized orders');
reset role;
update mira_private.admin_members set is_active=false where user_id='10000000-0000-0000-0000-000000000003';
set local role authenticated;
select public.mira_access_assert(public.get_admin_access()->>'isAdmin'='false','revoked membership is immediately reflected');
rollback;
