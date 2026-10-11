import type { Product } from "./product"

export type RentalStatus = "reserved" | "active" | "completed" | "cancelled"

export interface ProductSnapshot {
  id: string
  name: string
  slug: string
  coverUrl: string
  category: Product["category"]
}

export interface RentalOrder {
  id: string
  productId: string
  productSnapshot: ProductSnapshot
  customerName: string
  customerPhone: string
  rentalStartDate: string
  expectedReturnDate: string
  actualReturnDate: string | null
  rentalDays: number
  firstDayPriceSnapshot: number
  additionalDayPriceSnapshot: number
  suggestedPrice: number
  depositAmount: number
  additionalCharges: number
  discount: number
  actualRevenue: number
  status: RentalStatus
  notes: string
  createdAt: string
  completedAt: string | null
}
