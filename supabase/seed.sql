-- OPTIONAL DEMO ONLY. Generated from src/data by supabase/scripts/generate-seed.mjs.
-- Preserves product URLs /san-pham/1..8 via legacy_id. Does not create Auth users.
begin;
do $$ begin if exists(select 1 from public.products) or exists(select 1 from public.rental_orders) then
  raise exception 'DEMO_SEED_REQUIRES_EMPTY_CATALOGUE'; end if; end; $$;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-1')::uuid, '1', 'ao-dai-chouchou', 'Áo dài Chouchou', 'Áo dài',
  750000, 169000, 30000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['S', 'M'], array['Hồng phấn'], 'Lụa tơ mềm', 'Mấn đồng điệu',
  true, '2026-02-09T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-1-image-1')::uuid, md5('mira-product-1')::uuid, 'Áo dài Chouchou 1', 'https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-1-image-2')::uuid, md5('mira-product-1')::uuid, 'Áo dài Chouchou 2', 'https://images.unsplash.com/photo-1786417458008-a50550ba4335?auto=format&fit=crop&w=1200&q=88', 1);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-1-image-3')::uuid, md5('mira-product-1')::uuid, 'Áo dài Chouchou 3', 'https://images.unsplash.com/photo-1772698262407-5c69f802ed1c?auto=format&fit=crop&w=1200&q=88', 2);
update public.products set cover_image_id = md5('mira-image-1-image-1')::uuid where id = md5('mira-product-1')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-2')::uuid, '2', 'ao-dai-moc-lan', 'Áo dài Mộc Lan', 'Áo dài',
  890000, 189000, 40000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['S'], array['Trắng ngà'], 'Lụa thêu hoa', 'Mấn đồng điệu',
  false, '2026-01-10T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-2-image-1')::uuid, md5('mira-product-2')::uuid, 'Áo dài Mộc Lan 1', 'https://images.unsplash.com/photo-1571402104000-0967ca8acfed?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-2-image-2')::uuid, md5('mira-product-2')::uuid, 'Áo dài Mộc Lan 2', 'https://images.unsplash.com/photo-1776064350269-16747ae80bfa?auto=format&fit=crop&w=1200&q=88', 1);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-2-image-3')::uuid, md5('mira-product-2')::uuid, 'Áo dài Mộc Lan 3', 'https://images.unsplash.com/photo-1776064352619-918627da31e1?auto=format&fit=crop&w=1200&q=88', 2);
update public.products set cover_image_id = md5('mira-image-2-image-1')::uuid where id = md5('mira-product-2')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-3')::uuid, '3', 'ao-dai-tu-anh', 'Áo dài Tú Anh', 'Áo dài',
  950000, 199000, 40000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['M', 'L'], array['Cam hổ phách'], 'Gấm Nhật', 'Mấn đồng điệu',
  false, '2026-02-11T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-3-image-1')::uuid, md5('mira-product-3')::uuid, 'Áo dài Tú Anh 1', 'https://images.unsplash.com/photo-1643646805530-56f9a7ce2344?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-3-image-2')::uuid, md5('mira-product-3')::uuid, 'Áo dài Tú Anh 2', 'https://images.unsplash.com/photo-1763906802535-c6a4a13e352b?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-3-image-1')::uuid where id = md5('mira-product-3')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-4')::uuid, '4', 'ao-dai-nguyet-cat', 'Áo dài Nguyệt Cát', 'Áo dài',
  820000, 179000, 30000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['S', 'M'], array['Xanh sương'], 'Tơ óng', 'Mấn đồng điệu',
  false, '2026-01-12T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-4-image-1')::uuid, md5('mira-product-4')::uuid, 'Áo dài Nguyệt Cát 1', 'https://images.unsplash.com/photo-1763906802535-c6a4a13e352b?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-4-image-2')::uuid, md5('mira-product-4')::uuid, 'Áo dài Nguyệt Cát 2', 'https://images.unsplash.com/photo-1787588647989-3b659e729f97?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-4-image-1')::uuid where id = md5('mira-product-4')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-5')::uuid, '5', 'vay-rosalie', 'Váy Rosalie', 'Váy',
  1200000, 229000, 50000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['S'], array['Hồng đào'], 'Voan Pháp', 'Không kèm phụ kiện',
  false, '2026-02-13T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-5-image-1')::uuid, md5('mira-product-5')::uuid, 'Váy Rosalie 1', 'https://images.unsplash.com/photo-1786417458008-a50550ba4335?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-5-image-2')::uuid, md5('mira-product-5')::uuid, 'Váy Rosalie 2', 'https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-5-image-1')::uuid where id = md5('mira-product-5')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-6')::uuid, '6', 'ao-dai-bach-tra', 'Áo dài Bạch Trà', 'Áo dài',
  720000, 159000, 30000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['M'], array['Trắng sữa'], 'Lụa satin', 'Mấn đồng điệu',
  false, '2026-01-14T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-6-image-1')::uuid, md5('mira-product-6')::uuid, 'Áo dài Bạch Trà 1', 'https://images.unsplash.com/photo-1770821214788-6605c5c3075b?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-6-image-2')::uuid, md5('mira-product-6')::uuid, 'Áo dài Bạch Trà 2', 'https://images.unsplash.com/photo-1772698262407-5c69f802ed1c?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-6-image-1')::uuid where id = md5('mira-product-6')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-7')::uuid, '7', 'vay-celeste', 'Váy Celeste', 'Váy',
  1450000, 249000, 60000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['S', 'M'], array['Kem champagne'], 'Organza', 'Không kèm phụ kiện',
  false, '2026-02-15T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-7-image-1')::uuid, md5('mira-product-7')::uuid, 'Váy Celeste 1', 'https://images.unsplash.com/photo-1787588647989-3b659e729f97?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-7-image-2')::uuid, md5('mira-product-7')::uuid, 'Váy Celeste 2', 'https://images.unsplash.com/photo-1776064352619-918627da31e1?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-7-image-1')::uuid where id = md5('mira-product-7')::uuid;
insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (md5('mira-product-8')::uuid, '8', 'ao-dai-an-nhien', 'Áo dài An Nhiên', 'Áo dài',
  880000, 189000, 35000, 'Phom áo mềm mại, tôn dáng với đường nét thủ công tinh tế. Một thiết kế thanh nhã cho những ngày thật đáng nhớ.',
  array['M', 'L'], array['Trắng ngọc'], 'Lụa ngọc trai', 'Mấn đồng điệu',
  false, '2026-01-16T09:00:00.000Z', '2026-03-18T09:00:00.000Z');
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-8-image-1')::uuid, md5('mira-product-8')::uuid, 'Áo dài An Nhiên 1', 'https://images.unsplash.com/photo-1776064350269-16747ae80bfa?auto=format&fit=crop&w=1200&q=88', 0);
insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (md5('mira-image-8-image-2')::uuid, md5('mira-product-8')::uuid, 'Áo dài An Nhiên 2', 'https://images.unsplash.com/photo-1571402104000-0967ca8acfed?auto=format&fit=crop&w=1200&q=88', 1);
update public.products set cover_image_id = md5('mira-image-8-image-1')::uuid where id = md5('mira-product-8')::uuid;
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260318-01')::uuid, 'MIRA-260318-01', md5('mira-request-MIRA-260318-01')::uuid,
  md5('mira-product-2')::uuid, md5('mira-image-2-image-1')::uuid,
  '{"id":"2","name":"Áo dài Mộc Lan","slug":"ao-dai-moc-lan","coverUrl":"https://images.unsplash.com/photo-1571402104000-0967ca8acfed?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Trần Ngọc Mai', '0912 435 886',
  '2026-03-22', '2026-03-24', null,
  189000, 40000, 500000,
  0, 0, 0, 'reserved', '',
  '2026-03-22T08:00:00.000Z', null,
  null, null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260316-02')::uuid, 'MIRA-260316-02', md5('mira-request-MIRA-260316-02')::uuid,
  md5('mira-product-3')::uuid, md5('mira-image-3-image-1')::uuid,
  '{"id":"3","name":"Áo dài Tú Anh","slug":"ao-dai-tu-anh","coverUrl":"https://images.unsplash.com/photo-1643646805530-56f9a7ce2344?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Nguyễn Minh Anh', '0912 435 886',
  '2026-03-16', '2026-03-19', null,
  199000, 40000, 500000,
  0, 0, 0, 'active', '',
  '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z',
  null, null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260317-03')::uuid, 'MIRA-260317-03', md5('mira-request-MIRA-260317-03')::uuid,
  md5('mira-product-6')::uuid, md5('mira-image-6-image-1')::uuid,
  '{"id":"6","name":"Áo dài Bạch Trà","slug":"ao-dai-bach-tra","coverUrl":"https://images.unsplash.com/photo-1770821214788-6605c5c3075b?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Phạm Hà My', '0912 435 886',
  '2026-03-25', '2026-03-27', null,
  159000, 30000, 500000,
  0, 0, 0, 'reserved', '',
  '2026-03-25T08:00:00.000Z', null,
  null, null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260317-04')::uuid, 'MIRA-260317-04', md5('mira-request-MIRA-260317-04')::uuid,
  md5('mira-product-7')::uuid, md5('mira-image-7-image-1')::uuid,
  '{"id":"7","name":"Váy Celeste","slug":"vay-celeste","coverUrl":"https://images.unsplash.com/photo-1787588647989-3b659e729f97?auto=format&fit=crop&w=1200&q=88","category":"Váy"}'::jsonb, 'Lê Thu Trang', '0912 435 886',
  '2026-03-17', '2026-03-20', null,
  249000, 60000, 500000,
  0, 0, 0, 'active', '',
  '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z',
  null, null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260312-05')::uuid, 'MIRA-260312-05', md5('mira-request-MIRA-260312-05')::uuid,
  md5('mira-product-1')::uuid, md5('mira-image-1-image-1')::uuid,
  '{"id":"1","name":"Áo dài Chouchou","slug":"ao-dai-chouchou","coverUrl":"https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Đỗ Bảo Ngọc', '0912 435 886',
  '2026-03-12', '2026-03-14', '2026-03-14',
  169000, 30000, 500000,
  0, 0, 229000, 'completed', '',
  '2026-03-12T08:00:00.000Z', '2026-03-12T08:00:00.000Z',
  '2026-03-14T17:30:00.000Z', null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260305-06')::uuid, 'MIRA-260305-06', md5('mira-request-MIRA-260305-06')::uuid,
  md5('mira-product-4')::uuid, md5('mira-image-4-image-1')::uuid,
  '{"id":"4","name":"Áo dài Nguyệt Cát","slug":"ao-dai-nguyet-cat","coverUrl":"https://images.unsplash.com/photo-1763906802535-c6a4a13e352b?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Vũ Minh Châu', '0912 435 886',
  '2026-03-05', '2026-03-06', '2026-03-06',
  179000, 30000, 500000,
  0, 0, 209000, 'completed', '',
  '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z',
  '2026-03-06T18:00:00.000Z', null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260214-07')::uuid, 'MIRA-260214-07', md5('mira-request-MIRA-260214-07')::uuid,
  md5('mira-product-5')::uuid, md5('mira-image-5-image-1')::uuid,
  '{"id":"5","name":"Váy Rosalie","slug":"vay-rosalie","coverUrl":"https://images.unsplash.com/photo-1786417458008-a50550ba4335?auto=format&fit=crop&w=1200&q=88","category":"Váy"}'::jsonb, 'Hoàng Khánh Linh', '0912 435 886',
  '2026-02-12', '2026-02-14', '2026-02-14',
  229000, 50000, 500000,
  0, 0, 329000, 'completed', '',
  '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z',
  '2026-02-14T16:20:00.000Z', null);
insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (md5('mira-order-MIRA-260118-08')::uuid, 'MIRA-260118-08', md5('mira-request-MIRA-260118-08')::uuid,
  md5('mira-product-8')::uuid, md5('mira-image-8-image-1')::uuid,
  '{"id":"8","name":"Áo dài An Nhiên","slug":"ao-dai-an-nhien","coverUrl":"https://images.unsplash.com/photo-1776064350269-16747ae80bfa?auto=format&fit=crop&w=1200&q=88","category":"Áo dài"}'::jsonb, 'Nguyễn Thùy Dương', '0912 435 886',
  '2026-01-16', '2026-01-18', '2026-01-18',
  189000, 35000, 500000,
  0, 0, 259000, 'completed', '',
  '2026-01-16T08:00:00.000Z', '2026-01-16T08:00:00.000Z',
  '2026-01-18T19:00:00.000Z', null);
commit;
