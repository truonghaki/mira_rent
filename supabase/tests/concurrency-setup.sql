-- Disposable database only. Creates a fixture for the two-session race test.
begin;
insert into auth.users(id,email) values ('10000000-0000-0000-0000-000000000099','mira-race@example.invalid');
insert into mira_private.admin_members(user_id,role) values ('10000000-0000-0000-0000-000000000099','admin');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000099',true);
select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000099","name":"Race Product","slug":"sql-race-product","category":"Áo dài","first_day_price":169000,"additional_day_price":30000}',
  '[{"id":"30000000-0000-0000-0000-000000000099","external_url":"https://example.com/race.jpg"}]');
commit;
