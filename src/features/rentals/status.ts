import type { ProductAvailability } from "@/types/product"
export type RentalIntent = "reserve" | "direct" | "cancel" | "start" | "complete"
export function getRentalIntent(
  from: ProductAvailability,
  to: ProductAvailability,
): RentalIntent | null {
  if (from === to) return null
  if (from === "available") return to === "reserved" ? "reserve" : "direct"
  if (from === "reserved") return to === "available" ? "cancel" : "start"
  return "complete"
}
