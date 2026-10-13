import type { Product, ProductImage } from "@/types/product";
import type { RentalOrder } from "@/types/rental";
import type { ShopSettings } from "@/types/settings";
import type { Database, Json } from "./database.types";
import { BackendError } from "./errors";
import { shopTimestamp } from "@/utils/date";
type CatalogRow = Database["public"]["Views"]["product_catalog"]["Row"];
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type RentalRow = Database["public"]["Tables"]["rental_orders"]["Row"];
type SettingsRow = Database["public"]["Tables"]["shop_settings"]["Row"];
export type ResolveImageUrl = (path: string) => string;
function text(value: unknown): string {
    if (typeof value !== "string")
        throw new BackendError("INVALID_DATA", "Dữ liệu cửa hàng chưa hợp lệ.");
    return value;
}
function money(value: unknown): number {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
        throw new BackendError("INVALID_DATA", "Dữ liệu giá chưa hợp lệ.");
    return value;
}
function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T {
    if (typeof value !== "string" || !allowed.includes(value as T))
        throw new BackendError("INVALID_DATA", "Trạng thái dữ liệu chưa hợp lệ.");
    return value as T;
}
export function mapImage(row: ImageRow, url: ResolveImageUrl): ProductImage {
    return { id: row.id, name: row.display_name, url: row.storage_path ? url(row.storage_path) : text(row.external_url),
        ...(row.storage_path ? { storagePath: row.storage_path } : { externalUrl: text(row.external_url) }) };
}
export function mapProduct(row: CatalogRow, images: ImageRow[], url: ResolveImageUrl): Product {
    return { id: text(row.frontend_id), slug: text(row.slug), name: text(row.name),
        category: enumValue(row.category, ["Áo dài", "Váy", "Khác"] as const),
        originalPrice: money(row.original_price), firstDayPrice: money(row.first_day_price), additionalDayPrice: money(row.additional_day_price),
        description: text(row.description), sizes: row.sizes || [], colors: row.colors || [], material: text(row.material), accessories: text(row.accessories),
        images: images.filter(i => i.product_id === row.id && i.deleted_at === null).sort((a, b) => a.sort_order - b.sort_order).map(i => mapImage(i, url)),
        coverImage: text(row.cover_image_id), status: enumValue(row.status, ["available", "reserved", "rented"] as const),
        isFeatured: row.is_featured === true, createdAt: text(row.created_at), updatedAt: text(row.updated_at) };
}
export function mapRental(row: RentalRow, url: ResolveImageUrl): RentalOrder {
    const snapshot = row.product_snapshot;
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
        throw new BackendError("INVALID_DATA", "Ảnh chụp đơn thuê chưa hợp lệ.");
    const productId = text(snapshot.id);
    return { id: row.order_code, productId,
        productSnapshot: { id: productId, name: text(snapshot.name), slug: text(snapshot.slug), category: enumValue(snapshot.category, ["Áo dài", "Váy", "Khác"] as const),
            coverUrl: typeof snapshot.coverStoragePath === "string" ? url(snapshot.coverStoragePath) : text(snapshot.coverUrl) },
        customerName: row.customer_name, customerPhone: row.customer_phone,
        rentalStartDate: row.rental_start_date, expectedReturnDate: row.expected_return_date, actualReturnDate: row.actual_return_date,
        rentalDays: money(row.rental_days), firstDayPriceSnapshot: money(row.first_day_price_snapshot), additionalDayPriceSnapshot: money(row.additional_day_price_snapshot),
        suggestedPrice: money(row.suggested_price), depositAmount: money(row.deposit_amount), additionalCharges: money(row.additional_charges), discount: money(row.discount),
        actualRevenue: money(row.actual_revenue), status: enumValue(row.status, ["reserved", "active", "completed", "cancelled"] as const),
        notes: row.notes, createdAt: row.created_at, completedAt: row.completed_at ? shopTimestamp(row.completed_at) : null };
}
export function mapSettings(row: SettingsRow): ShopSettings {
    return { name: text(row.name), tagline: text(row.tagline), owner: text(row.owner_name), phone: text(row.phone), instagramUrl: text(row.instagram_url),
        zaloUrl: text(row.zalo_url), tiktokUrl: text(row.tiktok_url), address: text(row.address) };
}
export function productPayload(product: Product): Json {
    return { id: product.id, name: product.name, slug: product.slug, category: product.category,
        original_price: product.originalPrice, first_day_price: product.firstDayPrice, additional_day_price: product.additionalDayPrice,
        description: product.description, sizes: product.sizes, colors: product.colors, material: product.material,
        accessories: product.accessories, cover_image_id: product.coverImage, is_featured: product.isFeatured };
}
export function imagesPayload(images: ProductImage[]): Json {
    return images.map(image => ({ id: image.id, display_name: image.name,
        ...(image.storagePath ? { storage_path: image.storagePath } : { external_url: image.externalUrl || image.url }) }));
}
