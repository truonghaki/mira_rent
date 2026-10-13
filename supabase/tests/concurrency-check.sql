do $$
begin
  if (select count(*) from public.rental_orders where product_id = '20000000-0000-0000-0000-000000000099' and status in ('reserved', 'active')) <> 1 then
    raise exception 'FAIL: concurrent reservation created a duplicate or no order';
  end if;
  if public.product_availability('20000000-0000-0000-0000-000000000099') <> 'reserved' then
    raise exception 'FAIL: availability diverged from order state';
  end if;
  raise notice 'PASS: two concurrent clients produce exactly one reservation';
end;
$$;
