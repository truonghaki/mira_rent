import type { ProductAvailability } from "@/types/product"
import { availabilityText } from "./status-labels"
import { statusText } from "./status-labels"
export interface StatusPillProps {
  status: ProductAvailability
  audience?: "customer" | "admin"
}
export default function StatusPill({
  status,
  audience = "customer",
}: StatusPillProps) {
  return (
    <span className={`status status-${status}`}>
      <i />
      {(audience === "admin" ? availabilityText : statusText)[status]}
    </span>
  )
}
