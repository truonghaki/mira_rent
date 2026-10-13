import { useRentals } from "@/features/rentals/useRentals"
import { useMemo } from "react"
import { revenueSummary } from "./calculations"
import { todayDate } from "@/utils/date"
export function useRevenue() {
  const { orders } = useRentals()
  const calendarMonth = todayDate().slice(0,7)
  return useMemo(() => revenueSummary(orders), [orders, calendarMonth])
}
