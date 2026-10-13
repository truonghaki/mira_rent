-- All browser writes are authenticated commands, not arbitrary table mutations.
begin;

create function mira_private.product_id(p_reference text) returns uuid
language sql stable set search_path = ''
as $$
  select p.id from public.products p where p.id::text = p_reference or p.legacy_id = p_reference;
$$;

create function mira_private.lock_order(p_order_code text) returns public.rental_orders
language plpgsql set search_path = ''
as $$
declare v_product_id uuid; v_order public.rental_orders;
begin
  select o.product_id into v_product_id from public.rental_orders o where o.order_code = p_order_code;
  if not found then raise exception using errcode = 'P0002', message = 'RENTAL_NOT_FOUND'; end if;
  -- Always acquire locks in product -> order order to avoid command deadlocks.
  perform 1 from public.products p where p.id = v_product_id for update;
  select * into v_order from public.rental_orders o where o.order_code = p_order_code for update;
  return v_order;
end;
$$;

create function public.save_product(p_product jsonb, p_images jsonb, p_expected_version bigint default null)
returns public.products
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid; v_old public.products; v_result public.products; v_cover uuid;
  v_images uuid[]; v_image jsonb; v_image_id uuid; v_index bigint;
  v_storage text; v_external text;
begin
  perform mira_private.require_admin();
  if jsonb_typeof(p_product) is distinct from 'object' or
     jsonb_typeof(p_images) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'INVALID_PRODUCT_PAYLOAD';
  end if;
  if p_product ? 'status' or p_product ? 'legacy_id' then
    raise exception using errcode = '22023', message = 'STATUS_AND_LEGACY_ID_CANNOT_BE_EDITED';
  end if;
  if jsonb_array_length(p_images) = 0 then
    raise exception using errcode = '22023', message = 'PRODUCT_NEEDS_IMAGE';
  end if;
  v_id := coalesce(mira_private.product_id(p_product->>'id'),
    nullif(p_product->>'id', '')::uuid, gen_random_uuid());
  select * into v_old from public.products p where p.id = v_id for update;
  if found then
    if v_old.deleted_at is not null then raise exception using errcode = '55000', message = 'PRODUCT_ARCHIVED'; end if;
    if p_expected_version is distinct from v_old.version then
      raise exception using errcode = '40001', message = 'VERSION_CONFLICT';
    end if;
  elsif p_expected_version is not null and p_expected_version <> 0 then
    raise exception using errcode = '40001', message = 'VERSION_CONFLICT';
  end if;
  select array_agg((element->>'id')::uuid order by position) into v_images
    from jsonb_array_elements(p_images) with ordinality as images(element, position);
  if array_position(v_images, null) is not null or
     cardinality(v_images) <> (select count(distinct image_id) from unnest(v_images) image_id) then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE_IDS';
  end if;
  v_cover := coalesce((p_product->>'cover_image_id')::uuid, v_images[1]);
  if not (v_cover = any(v_images)) then
    raise exception using errcode = '22023', message = 'COVER_NOT_IN_IMAGES';
  end if;
  if exists(select 1 from public.product_images i where i.id = any(v_images) and i.product_id <> v_id) then
    raise exception using errcode = '22023', message = 'IMAGE_BELONGS_TO_OTHER_PRODUCT';
  end if;

  if v_old.id is null then
    insert into public.products(id, name, slug, category, original_price, first_day_price, additional_day_price,
      description, sizes, colors, material, accessories, is_featured)
    values (v_id, trim(p_product->>'name'), p_product->>'slug',
      (p_product->>'category')::public.mira_product_category, coalesce((p_product->>'original_price')::bigint, 0),
      (p_product->>'first_day_price')::bigint, (p_product->>'additional_day_price')::bigint,
      coalesce(p_product->>'description', ''),
      array(select jsonb_array_elements_text(coalesce(p_product->'sizes', '[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(p_product->'colors', '[]'::jsonb))),
      coalesce(p_product->>'material', ''), coalesce(p_product->>'accessories', ''),
      coalesce((p_product->>'is_featured')::boolean, false));
  else
    update public.products set name = trim(p_product->>'name'), slug = p_product->>'slug',
      category = (p_product->>'category')::public.mira_product_category,
      original_price = coalesce((p_product->>'original_price')::bigint, 0),
      first_day_price = (p_product->>'first_day_price')::bigint,
      additional_day_price = (p_product->>'additional_day_price')::bigint,
      description = coalesce(p_product->>'description', ''),
      sizes = array(select jsonb_array_elements_text(coalesce(p_product->'sizes', '[]'::jsonb))),
      colors = array(select jsonb_array_elements_text(coalesce(p_product->'colors', '[]'::jsonb))),
      material = coalesce(p_product->>'material', ''), accessories = coalesce(p_product->>'accessories', ''),
      is_featured = coalesce((p_product->>'is_featured')::boolean, false)
    where id = v_id;
  end if;

  -- Release active position constraints before a reorder, within this transaction.
  update public.product_images set deleted_at = now() where product_id = v_id and deleted_at is null;
  for v_image, v_index in select element, position from jsonb_array_elements(p_images)
    with ordinality as images(element, position)
  loop
    v_image_id := (v_image->>'id')::uuid;
    v_storage := nullif(v_image->>'storage_path', '');
    v_external := nullif(v_image->>'external_url', '');
    if exists(select 1 from public.product_images i where i.id = v_image_id and
      (i.storage_path is distinct from v_storage or i.external_url is distinct from v_external)) then
      raise exception using errcode = '55000', message = 'IMAGE_SOURCE_IS_IMMUTABLE';
    end if;
    if v_storage is not null and not exists(select 1 from storage.objects o
      where o.bucket_id = 'mira-product-images' and o.name = v_storage) then
      raise exception using errcode = '22023', message = 'STORAGE_OBJECT_NOT_FOUND';
    end if;
    insert into public.product_images(id, product_id, display_name, storage_path, external_url, sort_order)
    values (v_image_id, v_id, coalesce(v_image->>'display_name', ''), v_storage, v_external, (v_index - 1)::integer)
    on conflict(id) do update set display_name = excluded.display_name, sort_order = excluded.sort_order, deleted_at = null;
  end loop;
  update public.products set cover_image_id = v_cover where id = v_id returning * into v_result;
  return v_result;
end;
$$;

create function public.archive_product(p_product_ref text, p_expected_version bigint)
returns public.products
language plpgsql security definer set search_path = ''
as $$
declare v_product public.products;
begin
  perform mira_private.require_admin();
  select * into v_product from public.products p where p.id = mira_private.product_id(p_product_ref) for update;
  if not found then raise exception using errcode = 'P0002', message = 'PRODUCT_NOT_FOUND'; end if;
  if v_product.deleted_at is not null then return v_product; end if;
  if p_expected_version is distinct from v_product.version then raise exception using errcode = '40001', message = 'VERSION_CONFLICT'; end if;
  if exists(select 1 from public.rental_orders o where o.product_id = v_product.id and o.status in ('reserved', 'active')) then
    raise exception using errcode = '55000', message = 'PRODUCT_HAS_OPEN_RENTAL';
  end if;
  update public.products set deleted_at = now() where id = v_product.id returning * into v_product;
  return v_product;
end;
$$;

create function public.create_rental(
  p_product_ref text, p_rental_start_date date, p_expected_return_date date,
  p_customer_name text default '', p_customer_phone text default '', p_deposit_amount bigint default 0,
  p_notes text default '', p_start_immediately boolean default false, p_request_id uuid default gen_random_uuid()
) returns public.rental_orders
language plpgsql security definer set search_path = ''
as $$
declare v_product public.products; v_image public.product_images; v_order public.rental_orders; v_payload jsonb;
begin
  perform mira_private.require_admin();
  if p_request_id is null or p_start_immediately is null then
    raise exception using errcode = '22023', message = 'INVALID_RENTAL_REQUEST';
  end if;
  select * into v_product from public.products p where p.id = mira_private.product_id(p_product_ref) for update;
  if not found then raise exception using errcode = 'P0002', message = 'PRODUCT_NOT_FOUND'; end if;
  v_payload := jsonb_build_object('productId', v_product.id, 'startDate', p_rental_start_date,
    'expectedReturnDate', p_expected_return_date, 'customerName', p_customer_name,
    'customerPhone', p_customer_phone, 'depositAmount', p_deposit_amount, 'notes', p_notes,
    'startImmediately', p_start_immediately);
  select * into v_order from public.rental_orders o where o.create_request_id = p_request_id;
  if found then
    if v_order.create_request_payload is distinct from v_payload then
      raise exception using errcode = '22023', message = 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return v_order;
  end if;
  if v_product.deleted_at is not null then raise exception using errcode = '55000', message = 'PRODUCT_ARCHIVED'; end if;
  if exists(select 1 from public.rental_orders o where o.product_id = v_product.id and o.status in ('reserved', 'active')) then
    raise exception using errcode = '55000', message = 'PRODUCT_UNAVAILABLE';
  end if;
  select * into v_image from public.product_images i where i.id = v_product.cover_image_id and i.deleted_at is null;
  if not found then raise exception using errcode = '55000', message = 'PRODUCT_NEEDS_IMAGE'; end if;
  insert into public.rental_orders(product_id, create_request_id, create_request_payload, snapshot_cover_image_id, product_snapshot,
    customer_name, customer_phone, rental_start_date, expected_return_date, first_day_price_snapshot,
    additional_day_price_snapshot, deposit_amount, notes, status, started_at, created_by)
  values (v_product.id, p_request_id, v_payload, v_image.id,
    jsonb_build_object('id', coalesce(v_product.legacy_id, v_product.id::text), 'name', v_product.name,
      'slug', v_product.slug, 'category', v_product.category, 'coverUrl', coalesce(v_image.external_url, ''),
      'coverStoragePath', v_image.storage_path),
    p_customer_name, p_customer_phone, p_rental_start_date, p_expected_return_date,
    v_product.first_day_price, v_product.additional_day_price, p_deposit_amount, p_notes,
    case when p_start_immediately then 'active'::public.mira_rental_status else 'reserved'::public.mira_rental_status end,
    case when p_start_immediately then now() else null end, auth.uid()) returning * into v_order;
  update public.products set updated_at = now() where id = v_product.id;
  return v_order;
end;
$$;

create function public.start_rental(p_order_code text, p_expected_version bigint, p_draft jsonb default '{}')
returns public.rental_orders
language plpgsql security definer set search_path = ''
as $$
declare v_order public.rental_orders; v_start date; v_end date; v_name text; v_phone text; v_deposit bigint; v_notes text;
begin
  perform mira_private.require_admin();
  if jsonb_typeof(p_draft) is distinct from 'object' then raise exception using errcode = '22023', message = 'INVALID_RENTAL_DRAFT'; end if;
  v_order := mira_private.lock_order(p_order_code);
  v_start := coalesce((p_draft->>'rental_start_date')::date, v_order.rental_start_date);
  v_end := coalesce((p_draft->>'expected_return_date')::date, v_order.expected_return_date);
  v_name := coalesce(p_draft->>'customer_name', v_order.customer_name);
  v_phone := coalesce(p_draft->>'customer_phone', v_order.customer_phone);
  v_deposit := coalesce((p_draft->>'deposit_amount')::bigint, v_order.deposit_amount);
  v_notes := coalesce(p_draft->>'notes', v_order.notes);
  if v_order.status = 'active' and (v_order.rental_start_date, v_order.expected_return_date,
    v_order.customer_name, v_order.customer_phone, v_order.deposit_amount, v_order.notes) is not distinct from
    (v_start, v_end, v_name, v_phone, v_deposit, v_notes) then return v_order; end if;
  if v_order.status <> 'reserved' then raise exception using errcode = '55000', message = 'RENTAL_NOT_RESERVED'; end if;
  if p_expected_version is distinct from v_order.version then raise exception using errcode = '40001', message = 'VERSION_CONFLICT'; end if;
  update public.rental_orders set status = 'active', started_at = now(), rental_start_date = v_start,
    expected_return_date = v_end, customer_name = v_name, customer_phone = v_phone,
    deposit_amount = v_deposit, notes = v_notes where id = v_order.id returning * into v_order;
  update public.products set updated_at = now() where id = v_order.product_id;
  return v_order;
end;
$$;

create function public.cancel_reservation(p_order_code text, p_expected_version bigint)
returns public.rental_orders
language plpgsql security definer set search_path = ''
as $$
declare v_order public.rental_orders;
begin
  perform mira_private.require_admin();
  v_order := mira_private.lock_order(p_order_code);
  if v_order.status = 'cancelled' then return v_order; end if;
  if v_order.status <> 'reserved' then raise exception using errcode = '55000', message = 'RENTAL_NOT_RESERVED'; end if;
  if p_expected_version is distinct from v_order.version then raise exception using errcode = '40001', message = 'VERSION_CONFLICT'; end if;
  update public.rental_orders set status = 'cancelled', cancelled_at = now()
    where id = v_order.id returning * into v_order;
  update public.products set updated_at = now() where id = v_order.product_id;
  return v_order;
end;
$$;

create function public.complete_rental(
  p_order_code text, p_expected_version bigint, p_actual_return_date date,
  p_additional_charges bigint default 0, p_discount bigint default 0,
  p_actual_revenue bigint default null, p_notes text default null
) returns public.rental_orders
language plpgsql security definer set search_path = ''
as $$
declare v_order public.rental_orders; v_suggested bigint; v_revenue bigint; v_notes text;
begin
  perform mira_private.require_admin();
  v_order := mira_private.lock_order(p_order_code);
  if p_actual_return_date is null or not isfinite(p_actual_return_date) or
     p_actual_return_date < v_order.rental_start_date or p_additional_charges is null or
     p_discount is null or p_additional_charges < 0 or p_discount < 0 or p_actual_revenue < 0 then
    raise exception using errcode = '22023', message = 'INVALID_COMPLETION';
  end if;
  v_suggested := v_order.first_day_price_snapshot +
    (p_actual_return_date - v_order.rental_start_date)::bigint * v_order.additional_day_price_snapshot;
  v_revenue := coalesce(p_actual_revenue, greatest(0, v_suggested + p_additional_charges - p_discount));
  v_notes := coalesce(p_notes, v_order.notes);
  if v_order.status = 'completed' and (v_order.actual_return_date, v_order.additional_charges,
    v_order.discount, v_order.actual_revenue, v_order.notes) is not distinct from
    (p_actual_return_date, p_additional_charges, p_discount, v_revenue, v_notes) then return v_order; end if;
  if v_order.status <> 'active' then raise exception using errcode = '55000', message = 'RENTAL_NOT_ACTIVE'; end if;
  if p_expected_version is distinct from v_order.version then raise exception using errcode = '40001', message = 'VERSION_CONFLICT'; end if;
  update public.rental_orders set status = 'completed', actual_return_date = p_actual_return_date,
    additional_charges = p_additional_charges, discount = p_discount, actual_revenue = v_revenue,
    notes = v_notes, completed_at = now(), completed_by = auth.uid()
    where id = v_order.id returning * into v_order;
  update public.products set updated_at = now() where id = v_order.product_id;
  return v_order;
end;
$$;

create function public.save_shop_settings(p_settings jsonb, p_expected_version bigint)
returns public.shop_settings
language plpgsql security definer set search_path = ''
as $$
declare v_settings public.shop_settings;
begin
  perform mira_private.require_admin();
  if jsonb_typeof(p_settings) is distinct from 'object' then raise exception using errcode = '22023', message = 'INVALID_SETTINGS'; end if;
  select * into v_settings from public.shop_settings where id = true for update;
  if p_expected_version is distinct from v_settings.version then raise exception using errcode = '40001', message = 'VERSION_CONFLICT'; end if;
  update public.shop_settings set name = trim(p_settings->>'name'), tagline = coalesce(p_settings->>'tagline', ''),
    owner_name = coalesce(p_settings->>'owner_name', ''), phone = coalesce(p_settings->>'phone', ''),
    instagram_url = coalesce(p_settings->>'instagram_url', ''), zalo_url = coalesce(p_settings->>'zalo_url', ''),
    tiktok_url = coalesce(p_settings->>'tiktok_url', ''), address = coalesce(p_settings->>'address', '')
    where id = true returning * into v_settings;
  return v_settings;
end;
$$;

revoke all on function mira_private.product_id(text), mira_private.lock_order(text) from public, anon, authenticated;
revoke all on function public.save_product(jsonb, jsonb, bigint), public.archive_product(text, bigint),
  public.create_rental(text, date, date, text, text, bigint, text, boolean, uuid),
  public.start_rental(text, bigint, jsonb), public.cancel_reservation(text, bigint),
  public.complete_rental(text, bigint, date, bigint, bigint, bigint, text),
  public.save_shop_settings(jsonb, bigint) from public, anon, authenticated;
grant execute on function public.save_product(jsonb, jsonb, bigint), public.archive_product(text, bigint),
  public.create_rental(text, date, date, text, text, bigint, text, boolean, uuid),
  public.start_rental(text, bigint, jsonb), public.cancel_reservation(text, bigint),
  public.complete_rental(text, bigint, date, bigint, bigint, bigint, text),
  public.save_shop_settings(jsonb, bigint) to authenticated;
commit;
