-- Public schema contract; use only a database with the project's migrations applied.
with relations as (
  select c.oid, c.relname, c.relkind from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in
    ('products','product_images','rental_orders','rental_events','shop_settings','product_catalog','rental_history','revenue_by_month')
), relation_data as (
  select r.relname, jsonb_build_object('kind',r.relkind, 'columns', (
    select jsonb_agg(jsonb_build_object('name',a.attname,'type',t.typname,'nullable',not a.attnotnull,
      'optional',a.atthasdef or not a.attnotnull or a.attidentity <> '',
      'generated',a.attgenerated <> '' or a.attidentity <> '') order by a.attnum)
    from pg_attribute a join pg_type t on t.oid = a.atttypid
    where a.attrelid = r.oid and a.attnum > 0 and not a.attisdropped
  ), 'relationships', coalesce((
    select jsonb_agg(jsonb_build_object('foreignKeyName',co.conname,
      'columns',array(select a.attname from unnest(co.conkey) with ordinality k(num,pos)
        join pg_attribute a on a.attrelid = co.conrelid and a.attnum = k.num order by k.pos),
      'isOneToOne',false,'referencedRelation',target.relname,
      'referencedColumns',array(select a.attname from unnest(co.confkey) with ordinality k(num,pos)
        join pg_attribute a on a.attrelid = co.confrelid and a.attnum = k.num order by k.pos)))
    from pg_constraint co join pg_class target on target.oid = co.confrelid
    where co.conrelid = r.oid and co.contype = 'f'
  ),'[]'::jsonb)) as body from relations r
), functions as (
  select p.proname, jsonb_build_object('returns',t.typname,'args',coalesce((
    select jsonb_agg(jsonb_build_object('name',p.proargnames[arg.pos], 'type',at.typname,
      'optional',arg.pos > p.pronargs - p.pronargdefaults) order by arg.pos)
    from unnest(p.proargtypes::oid[]) with ordinality arg(type_oid,pos)
    join pg_type at on at.oid = arg.type_oid
  ),'[]'::jsonb)) as body
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_type t on t.oid = p.prorettype
  where n.nspname = 'public' and p.proname in ('save_product','archive_product','create_rental','start_rental',
    'cancel_reservation','complete_rental','save_shop_settings','product_availability','get_admin_access','load_shop_snapshot')
), enums as (
  select t.typname, jsonb_agg(e.enumlabel order by e.enumsortorder) as body
  from pg_type t join pg_namespace n on n.oid = t.typnamespace join pg_enum e on e.enumtypid = t.oid
  where n.nspname = 'public' and t.typname like 'mira_%' group by t.typname
)
select jsonb_build_object('relations',(select jsonb_object_agg(relname,body) from relation_data),
  'functions',(select jsonb_object_agg(proname,body) from functions),
  'enums',(select jsonb_object_agg(typname,body) from enums));
