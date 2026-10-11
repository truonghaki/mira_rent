// Compatibility exports for existing integrations. New modules import their owner directly.
export { initialOrders } from "./data/orders"
export { photos } from "./data/photos"
export { initialProducts } from "./data/products"
export { initialSettings } from "./data/settings"
export { coverUrl } from "./features/products/images"
export { suggestedPrice } from "./features/rentals/pricing"
export type {
  Product,
  ProductAvailability,
  ProductImage,
} from "./types/product"
export type { ProductSnapshot, RentalOrder, RentalStatus } from "./types/rental"
export type { ShopSettings } from "./types/settings"
export { calendarDays } from "./utils/date"
