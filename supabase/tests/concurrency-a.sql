begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000099',true);
select public.create_rental('20000000-0000-0000-0000-000000000099','2026-03-18','2026-03-20',
  p_request_id=>'40000000-0000-0000-0000-000000000099');
-- The command has acquired locks; hold the transaction while client B arrives.
select pg_sleep(2);
commit;
