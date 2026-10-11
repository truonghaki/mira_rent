import { initialOrders } from "@/data/orders"
import { initialProducts } from "@/data/products"
import { initialSettings } from "@/data/settings"
import type { ShopState } from "@/types/shop"
export function createDemoState(): ShopState {
  return structuredClone({
    products: initialProducts,
    orders: initialOrders,
    settings: initialSettings,
  })
}
