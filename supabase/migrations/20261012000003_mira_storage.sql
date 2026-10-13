-- Product photography is public. No customer documents belong in this bucket.
begin;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('mira-product-images', 'mira-product-images', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict(id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create function mira_private.storage_can_delete(p_path text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select mira_private.is_admin() and not exists (
    select 1 from public.product_images i where i.storage_path = p_path and
      (i.deleted_at is null or exists(select 1 from public.rental_orders o where o.snapshot_cover_image_id = i.id))
  );
$$;
revoke all on function mira_private.storage_can_delete(text) from public, anon, authenticated;
grant execute on function mira_private.storage_can_delete(text) to authenticated;

-- Restrictive guards also stop broader pre-existing policies opening this bucket.
create policy mira_images_insert_guard on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'mira-product-images' or ((select mira_private.is_admin()) and
    name ~ '^products/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'));
create policy mira_images_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'mira-product-images' and (select mira_private.is_admin()) and
    name ~ '^products/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$');

create policy mira_images_select_guard on storage.objects as restrictive for select to anon, authenticated
  using (bucket_id <> 'mira-product-images' or (select mira_private.is_admin()));
create policy mira_images_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'mira-product-images' and (select mira_private.is_admin()));

-- Append-only object names: never overwrite an image referenced by a snapshot.
create policy mira_images_no_overwrite on storage.objects as restrictive for update to anon, authenticated
  using (bucket_id <> 'mira-product-images') with check (bucket_id <> 'mira-product-images');

create policy mira_images_delete_guard on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'mira-product-images' or
    ((select mira_private.is_admin()) and mira_private.storage_can_delete(name)));
create policy mira_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'mira-product-images' and mira_private.storage_can_delete(name));
commit;
