import type { ProductAvailability } from "@/types/product"

export const statusText: Record<Status, string> = {
  available: "Còn sẵn",
  reserved: "Đã đặt",
  rented: "Đang cho thuê",
}

export type Status = ProductAvailability

export const availabilityText: Record<Status, string> = {
  available: "Chưa thuê",
  reserved: "Đã đặt",
  rented: "Đã thuê",
}
