import { useRentals } from "@/features/rentals/useRentals"
import { useMemo } from "react"
import { revenueSummary } from "./calculations"
export function useRevenue() {
  const { orders } = useRentals()
  const calendarMonth = `${new Date().getFullYear()}-${new Date().getMonth()}`
  return useMemo(() => revenueSummary(orders), [orders, calendarMonth])
}
