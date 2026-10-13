import type { RentalOrder } from "@/types/rental"
import { todayDate } from "@/utils/date"

export interface RevenueFilters {
  month?: string
  year?: string
  from?: string
  to?: string
  query?: string
}
export interface MonthlyRevenue {
  label: string
  revenue: number
  count: number
}

export function completedOrders(orders: RentalOrder[]): RentalOrder[] {
  return orders.filter((order) => order.status === "completed")
}

/** Deposits, reservations, active rentals and cancellations are never revenue. */
export function sumRevenue(orders: RentalOrder[]): number {
  return completedOrders(orders).reduce(
    (sum, order) => sum + order.actualRevenue,
    0,
  )
}

export function ordersInMonth(
  orders: RentalOrder[],
  date: Date,
): RentalOrder[] {
  return completedOrders(orders).filter((order) => {
    if (!order.completedAt) return false
    return todayDate(new Date(order.completedAt)).slice(0,7) === todayDate(date).slice(0,7)
  })
}

export function monthlySeries(
  orders: RentalOrder[],
  now = new Date(),
  months = 6,
): MonthlyRevenue[] {
  return Array.from({ length: months }, (_, index) => {
    const shopDay = todayDate(now)
    const date = new Date(
      Date.UTC(Number(shopDay.slice(0,4)), Number(shopDay.slice(5,7)) - months + index, 15, 12),
    )
    const matching = ordersInMonth(orders, date)
    return {
      label: `T${date.getUTCMonth() + 1}`,
      revenue: sumRevenue(matching),
      count: matching.length,
    }
  })
}

export function filterRevenueOrders(
  orders: RentalOrder[],
  filters: RevenueFilters,
): RentalOrder[] {
  return completedOrders(orders).filter((order) => {
    // Live mapper expresses timestamps at the shop offset; keep demo display-day semantics.
    const date = order.completedAt?.slice(0,10) || ""
    const text =
      `${order.productSnapshot.name} ${order.customerName}`.toLowerCase()
    return (
      (!filters.query || text.includes(filters.query.toLowerCase())) &&
      (!filters.month ||
        filters.month === "all" ||
        Number(date.slice(5, 7)) === Number(filters.month)) &&
      (!filters.year ||
        filters.year === "all" ||
        date.slice(0, 4) === filters.year) &&
      (!filters.from || date >= filters.from) &&
      (!filters.to || date <= filters.to)
    )
  })
}

export function revenueSummary(orders: RentalOrder[], now = new Date()) {
  const completed = completedOrders(orders)
  const thisMonth = ordersInMonth(completed, now)
  const shopDay = todayDate(now)
  const previous = new Date(Date.UTC(Number(shopDay.slice(0,4)), Number(shopDay.slice(5,7)) - 2, 15, 12))
  const previousOrders = ordersInMonth(completed, previous)
  const annualOrders = completed.filter((order) =>
    order.completedAt && todayDate(new Date(order.completedAt)).slice(0,4) === shopDay.slice(0,4),
  )
  const total = sumRevenue(completed)
  const currentRevenue = sumRevenue(thisMonth)
  const previousRevenue = sumRevenue(previousOrders)
  return {
    completed,
    thisMonth,
    previousOrders,
    currentRevenue,
    previousRevenue,
    annual: sumRevenue(annualOrders),
    annualCount: annualOrders.length,
    total,
    average: completed.length ? total / completed.length : 0,
    growth: previousRevenue
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 100,
    series: monthlySeries(completed, now),
  }
}
