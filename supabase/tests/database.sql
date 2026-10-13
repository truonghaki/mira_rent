-- Run against a disposable test project/database after the migrations.
-- Plain SQL assertions; no pgTAP dependency. Everything here rolls back.
begin;

create function public.mira_test_assert(p_condition boolean, p_description text) returns void
language plpgsql as $$ begin
  if p_condition is distinct from true then raise exception 'FAIL: %', p_description; end if;
  raise notice 'PASS: %', p_description;
end; $$;
create function public.mira_test_error(p_sql text, p_state text, p_message text, p_description text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlstate = p_state and (p_message is null or sqlerrm = p_message) then
      raise notice 'PASS: %', p_description; return;
    end if;
    raise exception 'FAIL: %, got %: %', p_description, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL: %, expected error %', p_description, p_state;
end; $$;
grant execute on function public.mira_test_assert(boolean,text), public.mira_test_error(text,text,text,text) to anon, authenticated;

insert into auth.users(id, email) values
  ('10000000-0000-0000-0000-000000000001', 'mira-test-admin@example.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'mira-test-outsider@example.invalid');
insert into mira_private.admin_members(user_id, role) values ('10000000-0000-0000-0000-000000000001', 'owner');

select public.mira_test_assert(not has_table_privilege('anon', 'public.rental_orders', 'select'), 'anon has no rental read grant');
select public.mira_test_assert(not has_table_privilege('authenticated', 'public.rental_orders', 'insert'), 'authenticated clients cannot insert rentals directly');
select public.mira_test_assert(not has_table_privilege('authenticated', 'public.products', 'update'), 'metadata writes require commands');
select public.mira_test_assert(not has_table_privilege('authenticated', 'mira_private.admin_members', 'insert'), 'clients cannot assign admin membership');
select public.mira_test_assert(not has_function_privilege('anon', 'public.create_rental(text,date,date,text,text,bigint,text,boolean,uuid)', 'execute'), 'anon cannot execute rental commands');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000001","name":"SQL Test Áo dài","slug":"sql-test-ao-dai","category":"Áo dài","original_price":750000,"first_day_price":169000,"additional_day_price":30000,"sizes":["S","M"]}',
  '[{"id":"30000000-0000-0000-0000-000000000001","display_name":"Original","external_url":"https://example.com/original.jpg"}]'
);
select public.mira_test_assert((select cover_image_id = '30000000-0000-0000-0000-000000000001' from public.products where id = '20000000-0000-0000-0000-000000000001'), 'product and cover save atomically');
select public.mira_test_error($s$select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000001","status":"rented"}', '[]', 2)$s$,
  '22023','STATUS_AND_LEGACY_ID_CANNOT_BE_EDITED','product CRUD cannot write availability');
select public.mira_test_error($s$select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000001"}', '[]', 2)$s$,
  '22023','PRODUCT_NEEDS_IMAGE','zero-image product is rejected');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select public.mira_test_assert((select count(*) = 1 from public.product_catalog where id = '20000000-0000-0000-0000-000000000001' and status = 'available'), 'visitor reads public catalogue');
select public.mira_test_assert((select count(*) = 1 from public.product_images where id = '30000000-0000-0000-0000-000000000001'), 'visitor reads active product image');
select public.mira_test_assert((select count(*) = 1 from public.shop_settings), 'visitor reads shop settings');
select public.mira_test_error('select * from public.rental_orders', '42501', null, 'visitor cannot read renter data');
select public.mira_test_error('select * from public.revenue_by_month', '42501', null, 'visitor cannot read revenue');
select public.mira_test_error('update public.shop_settings set name = ''Bad''', '42501', null, 'visitor cannot modify shop settings');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select public.mira_test_assert((select count(*) = 0 from public.rental_orders), 'non-admin account sees no rentals');
select public.mira_test_assert((select count(*) = 0 from public.rental_events), 'non-admin account sees no audit records');
select public.mira_test_assert((select count(*) = 0 from public.revenue_by_month), 'revenue view respects caller RLS');
select public.mira_test_error($s$select public.create_rental('20000000-0000-0000-0000-000000000001','2026-03-18','2026-03-20')$s$,
  '42501','ADMIN_REQUIRED','ordinary authenticated user cannot create rental');
select public.mira_test_error('select * from mira_private.admin_members', '42501', null, 'ordinary user cannot read member list');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.create_rental('20000000-0000-0000-0000-000000000001', '2026-03-18', '2026-03-20',
  'Test Customer', '', 500000, '', false, '40000000-0000-0000-0000-000000000001');
select public.mira_test_assert((select rental_days = 3 and suggested_price = 229000 and actual_revenue = 0 from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'), 'inclusive dates and server-side rental price');
select public.mira_test_assert(public.product_availability('20000000-0000-0000-0000-000000000001') = 'reserved', 'reservation updates availability');
select public.create_rental('20000000-0000-0000-0000-000000000001', '2026-03-18', '2026-03-20',
  'Test Customer', '', 500000, '', false, '40000000-0000-0000-0000-000000000001');
select public.mira_test_assert((select count(*) = 1 from public.rental_orders where product_id = '20000000-0000-0000-0000-000000000001'), 'create retry returns one order');
select public.mira_test_assert((select count(*) = 1 from public.rental_events where order_id = (select id from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001')), 'create retry does not duplicate audit event');
select public.mira_test_error($s$select public.create_rental('20000000-0000-0000-0000-000000000001','2026-03-18','2026-03-20','Test Customer','',500000,'',true,'40000000-0000-0000-0000-000000000001')$s$,
  '22023','IDEMPOTENCY_KEY_REUSED','request key cannot be reused for another intent');
select public.mira_test_error($s$select public.create_rental('20000000-0000-0000-0000-000000000001','2026-03-18','2026-03-20')$s$,
  '55000','PRODUCT_UNAVAILABLE','second open order is rejected');
select public.mira_test_error($s$select public.archive_product('20000000-0000-0000-0000-000000000001',3)$s$,
  '55000','PRODUCT_HAS_OPEN_RENTAL','cannot archive reserved product');
select public.mira_test_error($s$select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000001","name":"Bad","slug":"bad","category":"Áo dài","first_day_price":999000,"additional_day_price":999000}',
  '[{"id":"30000000-0000-0000-0000-000000000001","external_url":"https://example.com/changed.jpg"}]',3)$s$,
  '55000','IMAGE_SOURCE_IS_IMMUTABLE','cannot overwrite source of an existing image');
select public.mira_test_assert((select name = 'SQL Test Áo dài' and version = 3 from public.products where id = '20000000-0000-0000-0000-000000000001'), 'failed command rolls metadata back');
select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000001","name":"Updated Product","slug":"sql-test-ao-dai","category":"Áo dài","original_price":750000,"first_day_price":999000,"additional_day_price":999000}',
  '[{"id":"30000000-0000-0000-0000-000000000001","external_url":"https://example.com/original.jpg"}]',3
);
select public.mira_test_error($s$select public.archive_product('20000000-0000-0000-0000-000000000001',3)$s$,
  '40001','VERSION_CONFLICT','stale product version cannot overwrite newer data');
select public.start_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'),1,
  '{"expected_return_date":"2026-03-21","notes":"Started"}');
select public.mira_test_assert((select status = 'active' and suggested_price = 259000 and product_snapshot->>'name' = 'SQL Test Áo dài' from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'), 'start uses immutable price and product snapshots');
select public.create_rental('20000000-0000-0000-0000-000000000001', '2026-03-18', '2026-03-20',
  'Test Customer', '', 500000, '', false, '40000000-0000-0000-0000-000000000001');
select public.mira_test_assert((select count(*) = 1 from public.rental_orders where product_id = '20000000-0000-0000-0000-000000000001'), 'create idempotency survives later order edits');
select public.mira_test_error($s$select public.complete_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'),2,'2026-03-17')$s$,
  '22023','INVALID_COMPLETION','return date before start is rejected');
select public.mira_test_error($s$select public.complete_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'),1,'2026-03-20')$s$,
  '40001','VERSION_CONFLICT','completion checks rental version');
select public.complete_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'),2,
  '2026-03-20',50000,10000,123456,'Returned');
select public.mira_test_assert((select actual_revenue = 123456 and deposit_amount = 500000 and suggested_price = 229000 and rental_days = 3 from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'), 'completion preserves manually entered revenue and separates deposit');
select public.mira_test_assert(public.product_availability('20000000-0000-0000-0000-000000000001') = 'available', 'completion makes product available');
select public.complete_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'),2,
  '2026-03-20',50000,10000,123456,'Returned');
select public.mira_test_assert((select count(*) = 3 from public.rental_events where order_id = (select id from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001')), 'completion retry does not duplicate revenue or events');
select public.archive_product('20000000-0000-0000-0000-000000000001',(select version from public.products where id = '20000000-0000-0000-0000-000000000001'));
select public.mira_test_assert((select count(*) = 1 from public.rental_history where product_id = '20000000-0000-0000-0000-000000000001'), 'archive preserves completed history');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select public.mira_test_assert((select count(*) = 0 from public.product_catalog where id = '20000000-0000-0000-0000-000000000001'), 'archived product is hidden from visitors');
select public.mira_test_assert(public.product_availability('20000000-0000-0000-0000-000000000001') is null, 'status helper does not expose archived products');

reset role;
select public.mira_test_error($s$update public.rental_orders set actual_revenue = 0 where create_request_id = '40000000-0000-0000-0000-000000000001'$s$,
  '55000','RENTAL_FINALIZED','database rejects editing completed history');
select public.mira_test_error($s$delete from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000001'$s$,
  '55000','RENTAL_HISTORY_CANNOT_BE_DELETED','database rejects deleting rental history');

-- Storage tests include a deliberately broad unrelated policy to test guards.
create policy mira_test_broad_storage_policy on storage.objects for all to authenticated using(true) with check(true);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select public.mira_test_error($s$insert into storage.objects(bucket_id,name) values('mira-product-images','products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png')$s$,
  '42501',null,'non-admin upload denied despite another broad policy');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
insert into storage.objects(bucket_id,name) values
  ('mira-product-images','products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png'),
  ('mira-product-images','products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000003.png');
select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000002","name":"Storage Product","slug":"sql-test-storage-product","category":"Váy","first_day_price":169000,"additional_day_price":30000}',
  '[{"id":"30000000-0000-0000-0000-000000000002","storage_path":"products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png"}]'
);
select public.create_rental('20000000-0000-0000-0000-000000000002','2026-03-18','2026-03-20',p_start_immediately=>true,p_request_id=>'40000000-0000-0000-0000-000000000002');
select public.complete_rental((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000002'),1,'2026-03-20',50000,10000);
select public.mira_test_assert((select actual_revenue = 269000 from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000002'), 'server computes suggested revenue when no manual override');
select public.save_product(
  '{"id":"20000000-0000-0000-0000-000000000002","name":"Storage Product","slug":"sql-test-storage-product","category":"Váy","first_day_price":169000,"additional_day_price":30000}',
  '[{"id":"30000000-0000-0000-0000-000000000003","storage_path":"products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000003.png"}]',
  (select version from public.products where id = '20000000-0000-0000-0000-000000000002')
);
select public.mira_test_assert(not mira_private.storage_can_delete('products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png'), 'archived image referenced by history is protected');
delete from storage.objects where bucket_id = 'mira-product-images' and name = 'products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png';
select public.mira_test_assert((select count(*) = 1 from storage.objects where name = 'products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000002.png'), 'delete cannot break history image');
update storage.objects set name = 'changed.png' where bucket_id = 'mira-product-images';
select public.mira_test_assert((select count(*) = 2 from storage.objects where bucket_id = 'mira-product-images'), 'storage objects cannot be overwritten');
select public.mira_test_assert((select count(*) = 0 from storage.objects where name = 'changed.png'), 'broad policies cannot enable object rename');
insert into storage.objects(bucket_id,name) values('mira-product-images','products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000004.png');
delete from storage.objects where name = 'products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000004.png';
select public.mira_test_assert((select count(*) = 0 from storage.objects where name = 'products/20000000-0000-0000-0000-000000000002/30000000-0000-0000-0000-000000000004.png'), 'admin can remove orphan uploads');

select public.create_rental('20000000-0000-0000-0000-000000000002','2026-03-18','2026-03-20',p_request_id=>'40000000-0000-0000-0000-000000000003');
select public.cancel_reservation((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000003'),1);
select public.cancel_reservation((select order_code from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000003'),1);
select public.mira_test_assert((select status = 'cancelled' and actual_revenue = 0 from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000003'), 'cancel preserves record without revenue');
select public.mira_test_assert((select count(*) = 2 from public.rental_events where order_id = (select id from public.rental_orders where create_request_id = '40000000-0000-0000-0000-000000000003')), 'cancel retry does not duplicate events');

select public.mira_test_error($s$select public.save_shop_settings('{"name":"Bad"}',0)$s$,
  '40001','VERSION_CONFLICT','settings update checks version');
select public.save_shop_settings('{"name":"MIRA SQL Test","owner_name":"Test Owner"}',(select version from public.shop_settings));
select public.mira_test_assert((select name = 'MIRA SQL Test' from public.shop_settings), 'admin can update singleton settings');
select public.mira_test_assert((select sum(revenue) from public.revenue_by_month) = (select sum(actual_revenue) from public.rental_orders where status = 'completed'), 'analytics counts actual revenue of completed orders only');

reset role;
insert into public.rental_orders(order_code, product_id, snapshot_cover_image_id, product_snapshot,
  rental_start_date, expected_return_date, actual_return_date, first_day_price_snapshot,
  additional_day_price_snapshot, actual_revenue, status, created_at, started_at, completed_at)
values ('MIRA-TEST-TIMEZONE', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
  '{"id":"20000000-0000-0000-0000-000000000001","name":"Timezone","slug":"timezone","category":"Áo dài","coverUrl":"https://example.com/original.jpg"}',
  '2026-03-30','2026-04-01','2026-04-01',169000,30000,777000,'completed',
  '2026-03-30T08:00:00Z','2026-03-30T08:00:00Z','2026-03-31T18:00:00Z');
set local role authenticated;
select public.mira_test_assert((select revenue >= 777000 from public.revenue_by_month where month = '2026-04-01'), 'monthly analytics use Vietnam calendar boundaries');
reset role;
update mira_private.admin_members set is_active = false where user_id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
select public.mira_test_assert((select count(*) = 0 from public.rental_orders), 'disabling membership revokes access without a JWT refresh');
select public.mira_test_error($s$select public.create_rental('20000000-0000-0000-0000-000000000002','2026-03-18','2026-03-20')$s$,
  '42501','ADMIN_REQUIRED','disabled admin cannot issue commands');

set local role anon;
select set_config('request.jwt.claim.sub','',true);
select public.mira_test_assert((select count(*) = 0 from storage.objects where bucket_id = 'mira-product-images'), 'visitor cannot list storage metadata');
select public.mira_test_assert(public.product_availability('20000000-0000-0000-0000-000000000002') = 'available', 'public status works without exposing orders');

rollback;
