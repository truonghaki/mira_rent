import type { Product } from "./product"
import type { RentalOrder } from "./rental"
import type { ShopSettings } from "./settings"
export interface ShopState {
  products: Product[]
  orders: RentalOrder[]
  settings: ShopSettings
}
