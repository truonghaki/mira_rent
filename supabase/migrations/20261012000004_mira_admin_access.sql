-- Returns only the caller's access; never accepts another user's ID.
begin;
create function public.get_admin_access() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'isAdmin', mira_private.is_admin(),
    'role', (select m.role from mira_private.admin_members m
      where m.user_id = auth.uid() and m.is_active)
  );
$$;
revoke all on function public.get_admin_access() from public, anon, authenticated;
grant execute on function public.get_admin_access() to authenticated;

-- One statement snapshot keeps product availability and open orders consistent.
create function public.load_shop_snapshot(p_admin boolean default false) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_admin is null then raise exception using errcode = '22023', message = 'INVALID_READ_SCOPE'; end if;
  if p_admin then perform mira_private.require_admin(); end if;
  return jsonb_build_object(
    'products', coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at desc, p.id)
      from public.product_catalog p where p.deleted_at is null and p.cover_image_id is not null), '[]'::jsonb),
    'images', coalesce((select jsonb_agg(to_jsonb(i) order by i.product_id, i.sort_order)
      from public.product_images i join public.products p on p.id = i.product_id
      where i.deleted_at is null and p.deleted_at is null and p.cover_image_id is not null), '[]'::jsonb),
    'settings', (select to_jsonb(s) from public.shop_settings s where s.id = true),
    'orders', case when p_admin then coalesce((select jsonb_agg(to_jsonb(o) order by o.created_at desc, o.id)
      from public.rental_orders o), '[]'::jsonb) else '[]'::jsonb end
  );
end;
$$;
revoke all on function public.load_shop_snapshot(boolean) from public, anon, authenticated;
grant execute on function public.load_shop_snapshot(boolean) to anon, authenticated;
commit;
