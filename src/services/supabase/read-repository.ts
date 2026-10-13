import type { BackendSnapshot } from "@/services/contracts";
import type { MiraClient } from "./client";
import type { Database } from "./database.types";
import { backendError, BackendError } from "./errors";
import { mapProduct, mapRental, mapSettings } from "./mappers";
export const PRODUCT_BUCKET = "mira-product-images";
type CatalogRow = Database["public"]["Views"]["product_catalog"]["Row"];
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type OrderRow = Database["public"]["Tables"]["rental_orders"]["Row"];
type SettingsRow = Database["public"]["Tables"]["shop_settings"]["Row"];
function rows(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value) || value.some(row => !row || typeof row !== "object" || Array.isArray(row)))
        throw new BackendError("INVALID_DATA", "Dữ liệu cửa hàng chưa hợp lệ.");
    return value;
}
export function createReadRepository(client: MiraClient) {
    const url = (path: string) => client.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
    return { load: async (admin: boolean): Promise<BackendSnapshot> => {
            const { data, error } = await client.rpc("load_shop_snapshot", { p_admin: admin });
            if (error)
                throw backendError(error);
            if (!data || typeof data !== "object" || Array.isArray(data) || !data.settings || typeof data.settings !== "object" || Array.isArray(data.settings))
                throw new BackendError("INVALID_DATA", "Chưa có cấu hình cửa hàng.");
            const products = rows(data.products) as CatalogRow[], images = rows(data.images) as unknown as ImageRow[], orders = rows(data.orders) as unknown as OrderRow[];
            const settings = data.settings as SettingsRow;
            if (!admin && orders.length)
                throw new BackendError("INVALID_DATA", "Phạm vi dữ liệu chưa hợp lệ.");
            const productVersions: Record<string, number> = {}, productDatabaseIds: Record<string, string> = {}, orderVersions: Record<string, number> = {};
            for (const row of products) {
                if (!row.frontend_id || !row.id || !Number.isSafeInteger(row.version) || !row.version || row.version < 1)
                    throw new BackendError("INVALID_DATA", "Dữ liệu sản phẩm chưa hợp lệ.");
                productVersions[row.frontend_id] = row.version;
                productDatabaseIds[row.frontend_id] = row.id;
            }
            for (const row of orders) {
                if (!row.order_code || !Number.isSafeInteger(row.version) || row.version < 1)
                    throw new BackendError("INVALID_DATA", "Dữ liệu đơn thuê chưa hợp lệ.");
                orderVersions[row.order_code] = row.version;
            }
            if (!Number.isSafeInteger(settings.version) || settings.version < 1)
                throw new BackendError("INVALID_DATA", "Cấu hình cửa hàng chưa hợp lệ.");
            return { state: { products: products.map(p => mapProduct(p, images, url)), orders: orders.map(o => mapRental(o, url)), settings: mapSettings(settings) }, productVersions, productDatabaseIds, orderVersions, settingsVersion: settings.version };
        } };
}
