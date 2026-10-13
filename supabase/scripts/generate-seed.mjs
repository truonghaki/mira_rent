// Run: node --import ./scripts/register-typescript.mjs supabase/scripts/generate-seed.mjs
// Produces optional demo seed from the frontend's actual fixtures.
import fs from "node:fs/promises";
import { initialProducts } from "../../src/data/products.ts";
import { initialOrders } from "../../src/data/orders.ts";

const sqlText = (value) => value == null ? "null" : "'" + String(value).replaceAll("'", "''") + "'";
const uuid = (key) => `md5(${sqlText(key)})::uuid`;
const json = (value) => `${sqlText(JSON.stringify(value))}::jsonb`;
const sqlArray = (value) => value.length ? `array[${value.map(sqlText).join(", ")}]` : "'{}'::text[]";
const lines = [
  "-- OPTIONAL DEMO ONLY. Generated from src/data by supabase/scripts/generate-seed.mjs.",
  "-- Preserves product URLs /san-pham/1..8 via legacy_id. Does not create Auth users.",
  "begin;",
  "do $$ begin if exists(select 1 from public.products) or exists(select 1 from public.rental_orders) then",
  "  raise exception 'DEMO_SEED_REQUIRES_EMPTY_CATALOGUE'; end if; end; $$;",
];
for (const product of initialProducts) {
  const productId = uuid("mira-product-" + product.id);
  lines.push(`insert into public.products(id, legacy_id, slug, name, category, original_price, first_day_price, additional_day_price,
  description, sizes, colors, material, accessories, is_featured, created_at, updated_at)
values (${productId}, ${sqlText(product.id)}, ${sqlText(product.slug)}, ${sqlText(product.name)}, ${sqlText(product.category)},
  ${product.originalPrice}, ${product.firstDayPrice}, ${product.additionalDayPrice}, ${sqlText(product.description)},
  ${sqlArray(product.sizes)}, ${sqlArray(product.colors)}, ${sqlText(product.material)}, ${sqlText(product.accessories)},
  ${product.isFeatured}, ${sqlText(product.createdAt)}, ${sqlText(product.updatedAt)});`);
  for (const [index, image] of product.images.entries()) {
    lines.push(`insert into public.product_images(id, product_id, display_name, external_url, sort_order)
values (${uuid("mira-image-" + image.id)}, ${productId}, ${sqlText(image.name)}, ${sqlText(image.url)}, ${index});`);
  }
  lines.push(`update public.products set cover_image_id = ${uuid("mira-image-" + product.coverImage)} where id = ${productId};`);
}
for (const order of initialOrders) {
  const product = initialProducts.find((item) => item.id === order.productId);
  lines.push(`insert into public.rental_orders(id, order_code, create_request_id, product_id, snapshot_cover_image_id,
  product_snapshot, customer_name, customer_phone, rental_start_date, expected_return_date, actual_return_date,
  first_day_price_snapshot, additional_day_price_snapshot, deposit_amount, additional_charges, discount,
  actual_revenue, status, notes, created_at, started_at, completed_at, cancelled_at)
values (${uuid("mira-order-" + order.id)}, ${sqlText(order.id)}, ${uuid("mira-request-" + order.id)},
  ${uuid("mira-product-" + order.productId)}, ${uuid("mira-image-" + product.coverImage)},
  ${json(order.productSnapshot)}, ${sqlText(order.customerName)}, ${sqlText(order.customerPhone)},
  ${sqlText(order.rentalStartDate)}, ${sqlText(order.expectedReturnDate)}, ${sqlText(order.actualReturnDate)},
  ${order.firstDayPriceSnapshot}, ${order.additionalDayPriceSnapshot}, ${order.depositAmount},
  ${order.additionalCharges}, ${order.discount}, ${order.actualRevenue}, ${sqlText(order.status)}, ${sqlText(order.notes)},
  ${sqlText(order.createdAt)}, ${sqlText(["active", "completed"].includes(order.status) ? order.createdAt : null)},
  ${sqlText(order.completedAt)}, ${sqlText(order.status === "cancelled" ? order.createdAt : null)});`);
}
lines.push("commit;", "");
await fs.writeFile(new URL("../seed.sql", import.meta.url), lines.join("\n"));
console.log(`Generated demo seed: ${initialProducts.length} products and ${initialOrders.length} orders.`);
