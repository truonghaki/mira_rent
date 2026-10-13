-- MIRA RENT: single-shop, one physical rentable item per product.
-- Apply once to a Supabase PostgreSQL 15+ project, as the migration owner.
begin;

create schema if not exists mira_private;
revoke all on schema mira_private from public;
grant usage on schema mira_private to anon, authenticated;

create type public.mira_product_category as enum ('Áo dài', 'Váy', 'Khác');
create type public.mira_rental_status as enum ('reserved', 'active', 'completed', 'cancelled');
create type public.mira_product_availability as enum ('available', 'reserved', 'rented');

-- Membership is provisioned by the owner in SQL Editor, never by a browser.
create table mira_private.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table mira_private.admin_members enable row level security;
revoke all on mira_private.admin_members from public, anon, authenticated;

create function mira_private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from mira_private.admin_members m
    where m.user_id = auth.uid() and m.is_active
  );
$$;
revoke all on function mira_private.is_admin() from public, anon, authenticated;
grant execute on function mira_private.is_admin() to anon, authenticated;

create function mira_private.require_admin() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not mira_private.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
end;
$$;
revoke all on function mira_private.require_admin() from public, anon, authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique check (legacy_id is null or legacy_id ~ '^[0-9]+$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 200),
  category public.mira_product_category not null default 'Áo dài',
  original_price bigint not null default 0 check (original_price between 0 and 9007199254740991),
  first_day_price bigint not null check (first_day_price between 1 and 9007199254740991),
  additional_day_price bigint not null check (additional_day_price between 1 and 9007199254740991),
  description text not null default '',
  sizes text[] not null default '{}' check (array_position(sizes, null) is null),
  colors text[] not null default '{}' check (array_position(colors, null) is null),
  material text not null default '',
  accessories text not null default '',
  cover_image_id uuid,
  is_featured boolean not null default false,
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  display_name text not null default '',
  storage_path text unique,
  external_url text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, id),
  constraint image_has_one_source check (
    (storage_path is not null)::integer + (external_url is not null)::integer = 1
  ),
  constraint image_source_valid check (
    (external_url is null or external_url ~ '^https://[^[:space:]]+$') and
    (storage_path is null or storage_path ~ ('^products/' || product_id::text || '/' || id::text || '\.(jpg|jpeg|png|webp)$'))
  )
);
create unique index product_images_active_position on public.product_images(product_id, sort_order)
  where deleted_at is null;
alter table public.products add constraint cover_belongs_to_product
  foreign key (id, cover_image_id) references public.product_images(product_id, id)
  deferrable initially deferred;

create sequence mira_private.order_code_sequence;
create function mira_private.new_order_code() returns text
language sql volatile set search_path = ''
as $$
  select 'MIRA-' || to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYMMDD') || '-' ||
    lpad(nextval('mira_private.order_code_sequence'::regclass)::text, 8, '0');
$$;
revoke all on function mira_private.new_order_code() from public, anon, authenticated;
revoke all on sequence mira_private.order_code_sequence from public, anon, authenticated;

create table public.rental_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default mira_private.new_order_code(),
  create_request_id uuid not null unique default gen_random_uuid(),
  create_request_payload jsonb not null default '{}' check (jsonb_typeof(create_request_payload) = 'object'),
  product_id uuid not null references public.products(id) on delete restrict,
  snapshot_cover_image_id uuid,
  product_snapshot jsonb not null,
  customer_name text not null default '',
  customer_phone text not null default '',
  rental_start_date date not null,
  expected_return_date date not null,
  actual_return_date date,
  first_day_price_snapshot bigint not null check (first_day_price_snapshot between 1 and 9007199254740991),
  additional_day_price_snapshot bigint not null check (additional_day_price_snapshot between 1 and 9007199254740991),
  rental_days integer generated always as (
    coalesce(actual_return_date, expected_return_date) - rental_start_date + 1
  ) stored,
  suggested_price bigint generated always as (
    first_day_price_snapshot +
    (coalesce(actual_return_date, expected_return_date) - rental_start_date)::bigint * additional_day_price_snapshot
  ) stored check (suggested_price between 0 and 9007199254740991),
  deposit_amount bigint not null default 0 check (deposit_amount between 0 and 9007199254740991),
  additional_charges bigint not null default 0 check (additional_charges between 0 and 9007199254740991),
  discount bigint not null default 0 check (discount between 0 and 9007199254740991),
  actual_revenue bigint not null default 0 check (actual_revenue between 0 and 9007199254740991),
  status public.mira_rental_status not null default 'reserved',
  notes text not null default '',
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  -- Audit identities survive deletion of an Auth account; these are snapshots.
  created_by uuid,
  completed_by uuid,
  foreign key (product_id, snapshot_cover_image_id)
    references public.product_images(product_id, id) on delete restrict,
  constraint rental_dates_valid check (
    isfinite(rental_start_date) and isfinite(expected_return_date) and
    expected_return_date >= rental_start_date and
    (actual_return_date is null or (isfinite(actual_return_date) and actual_return_date >= rental_start_date))
  ),
  constraint snapshot_valid check (
    jsonb_typeof(product_snapshot) = 'object' and
    product_snapshot ?& array['id', 'name', 'slug', 'coverUrl', 'category'] and
    jsonb_typeof(product_snapshot->'id') = 'string' and
    jsonb_typeof(product_snapshot->'name') = 'string' and
    jsonb_typeof(product_snapshot->'slug') = 'string' and
    jsonb_typeof(product_snapshot->'coverUrl') = 'string' and
    jsonb_typeof(product_snapshot->'category') = 'string' and
    product_snapshot->>'category' in ('Áo dài', 'Váy', 'Khác')
  ),
  constraint rental_completion_valid check (
    (status = 'completed' and completed_at is not null and actual_return_date is not null) or
    (status <> 'completed' and completed_at is null and actual_return_date is null and
      actual_revenue = 0 and additional_charges = 0 and discount = 0)
  ),
  constraint rental_start_valid check ((status in ('active', 'completed')) = (started_at is not null)),
  constraint rental_cancel_valid check ((status = 'cancelled') = (cancelled_at is not null))
);

-- Matches the current frontend: one open reservation/rental per physical product.
create unique index rental_one_open_order_per_product on public.rental_orders(product_id)
  where status in ('reserved', 'active');
create index rental_completed_at_index on public.rental_orders(completed_at desc) where status = 'completed';
create index rental_expected_return_index on public.rental_orders(expected_return_date) where status in ('reserved', 'active');
create index rental_product_history_index on public.rental_orders(product_id, created_at desc);
create index product_catalog_order_index on public.products(created_at desc) where deleted_at is null;
create index product_category_index on public.products(category, created_at desc) where deleted_at is null;

create table public.rental_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.rental_orders(id) on delete restrict,
  actor_user_id uuid,
  from_status public.mira_rental_status,
  to_status public.mira_rental_status not null,
  occurred_at timestamptz not null default now(),
  details jsonb not null default '{}'
);
create index rental_events_order_index on public.rental_events(order_id, occurred_at, id);
revoke all on sequence public.rental_events_id_seq from public, anon, authenticated;

create table public.shop_settings (
  id boolean primary key default true check (id),
  name text not null default 'MIRA RENT' check (length(trim(name)) > 0),
  tagline text not null default '',
  owner_name text not null default '',
  phone text not null default '',
  instagram_url text not null default '' check (instagram_url = '' or instagram_url ~ '^https://[^[:space:]]+$'),
  zalo_url text not null default '' check (zalo_url = '' or zalo_url ~ '^https://[^[:space:]]+$'),
  tiktok_url text not null default '' check (tiktok_url = '' or tiktok_url ~ '^https://[^[:space:]]+$'),
  address text not null default '',
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
insert into public.shop_settings(name, tagline, owner_name, phone, instagram_url, tiktok_url, address)
values ('MIRA RENT', 'Dịu dàng trong từng khoảnh khắc', 'Thảo Hân', '0856 719 126',
  'https://www.instagram.com/mira_thueaodai/', 'https://www.tiktok.com/@mira.rent_thuedo',
  'LK31 Đường Nội, Hà Đông, Hà Nội');

create function mira_private.touch_version() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;
create trigger products_touch_version before update on public.products
  for each row execute function mira_private.touch_version();
create trigger rental_orders_touch_version before update on public.rental_orders
  for each row execute function mira_private.touch_version();
create trigger settings_touch_version before update on public.shop_settings
  for each row execute function mira_private.touch_version();

create function mira_private.guard_rental_history() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using errcode = '55000', message = 'RENTAL_HISTORY_CANNOT_BE_DELETED';
  end if;
  if old.status in ('completed', 'cancelled') then
    raise exception using errcode = '55000', message = 'RENTAL_FINALIZED';
  end if;
  if (new.id, new.order_code, new.product_id, new.create_request_id, new.create_request_payload, new.product_snapshot,
      new.snapshot_cover_image_id, new.first_day_price_snapshot, new.additional_day_price_snapshot,
      new.created_at) is distinct from
     (old.id, old.order_code, old.product_id, old.create_request_id, old.create_request_payload, old.product_snapshot,
      old.snapshot_cover_image_id, old.first_day_price_snapshot, old.additional_day_price_snapshot,
      old.created_at) then
    raise exception using errcode = '55000', message = 'RENTAL_SNAPSHOT_IS_IMMUTABLE';
  end if;
  if not ((old.status = 'reserved' and new.status in ('active', 'cancelled')) or
          (old.status = 'active' and new.status = 'completed')) then
    raise exception using errcode = '55000', message = 'INVALID_RENTAL_TRANSITION';
  end if;
  return new;
end;
$$;
create trigger rental_history_guard before update or delete on public.rental_orders
  for each row execute function mira_private.guard_rental_history();

create function mira_private.log_rental_event() returns trigger
language plpgsql set search_path = ''
as $$
begin
  insert into public.rental_events(order_id, actor_user_id, from_status, to_status, details)
  values (new.id, auth.uid(), case when tg_op = 'UPDATE' then old.status else null end,
    new.status, jsonb_build_object('actualRevenue', new.actual_revenue,
      'additionalCharges', new.additional_charges, 'discount', new.discount));
  return new;
end;
$$;
create trigger rental_event_log after insert or update on public.rental_orders
  for each row execute function mira_private.log_rental_event();

-- Read status without exposing renter identities or rental records to visitors.
create function public.product_availability(p_product_id uuid)
returns public.mira_product_availability
language sql stable security definer set search_path = ''
as $$
  select case
    when exists(select 1 from public.rental_orders o where o.product_id = p.id and o.status = 'active')
      then 'rented'::public.mira_product_availability
    when exists(select 1 from public.rental_orders o where o.product_id = p.id and o.status = 'reserved')
      then 'reserved'::public.mira_product_availability
    else 'available'::public.mira_product_availability end
  from public.products p
  where p.id = p_product_id and ((p.deleted_at is null and p.cover_image_id is not null) or mira_private.is_admin());
$$;
revoke all on function public.product_availability(uuid) from public, anon, authenticated;
grant execute on function public.product_availability(uuid) to anon, authenticated;

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.rental_orders enable row level security;
alter table public.rental_events enable row level security;
alter table public.shop_settings enable row level security;
revoke all on public.products, public.product_images, public.rental_orders,
  public.rental_events, public.shop_settings from public, anon, authenticated;
grant select on public.products, public.product_images, public.shop_settings to anon, authenticated;
grant select on public.rental_orders, public.rental_events to authenticated;

create policy products_read on public.products for select to anon, authenticated
  using ((deleted_at is null and cover_image_id is not null) or (select mira_private.is_admin()));
create policy product_images_read on public.product_images for select to anon, authenticated
  using ((select mira_private.is_admin()) or (deleted_at is null and exists (
    select 1 from public.products p where p.id = product_id and p.deleted_at is null and p.cover_image_id is not null
  )));
create policy rentals_admin_read on public.rental_orders for select to authenticated
  using ((select mira_private.is_admin()));
create policy rental_events_admin_read on public.rental_events for select to authenticated
  using ((select mira_private.is_admin()));
create policy settings_public_read on public.shop_settings for select to anon, authenticated using (true);

create view public.product_catalog with (security_invoker = true) as
  select p.*, coalesce(p.legacy_id, p.id::text) as frontend_id,
    public.product_availability(p.id) as status from public.products p;
create view public.rental_history with (security_invoker = true) as
  select * from public.rental_orders where status = 'completed';
create view public.revenue_by_month with (security_invoker = true) as
  select date_trunc('month', completed_at at time zone 'Asia/Ho_Chi_Minh')::date as month,
    count(*) as completed_orders, sum(actual_revenue) as revenue,
    avg(actual_revenue) as average_revenue
  from public.rental_orders where status = 'completed' group by 1;
revoke all on public.product_catalog, public.rental_history, public.revenue_by_month from public, anon, authenticated;
grant select on public.product_catalog to anon, authenticated;
grant select on public.rental_history, public.revenue_by_month to authenticated;

revoke all on function mira_private.touch_version(), mira_private.guard_rental_history(),
  mira_private.log_rental_event() from public, anon, authenticated;
commit;
