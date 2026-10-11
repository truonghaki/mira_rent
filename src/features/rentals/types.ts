import type { Product } from "@/types/product"
import type { RentalOrder } from "@/types/rental"

interface ReservationAction {
  type: "reserve" | "direct"
  product: Product
  order?: never
}

interface ExistingRentalAction {
  type: "start" | "complete"
  product: Product
  order: RentalOrder
}

export type RentalAction = ReservationAction | ExistingRentalAction
