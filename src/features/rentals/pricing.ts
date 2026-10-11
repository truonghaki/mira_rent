import type { Product } from "@/types/product"

export function suggestedPrice(
  item: Pick<Product, "firstDayPrice" | "additionalDayPrice">,
  days: number,
) {
  return calculateRentalPrice(item.firstDayPrice, item.additionalDayPrice, days)
}

export function calculateRentalPrice(
  firstDayPrice: number,
  additionalDayPrice: number,
  days: number,
): number {
  return firstDayPrice + Math.max(0, days - 1) * additionalDayPrice
}

export function calculateCompletionRevenue(
  suggested: number,
  additionalCharges: number,
  discount: number,
): number {
  return Math.max(0, suggested + additionalCharges - discount)
}
