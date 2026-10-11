import { coverUrl } from "@/features/products/images"
import type { Product } from "@/types/product"
import type { RentalOrder } from "@/types/rental"
import type { ShopState } from "@/types/shop"
import { calendarDays, isDateRangeValid } from "@/utils/date"
import type { CompletionDraft, RentalDraft } from "./drafts"
import { calculateRentalPrice, suggestedPrice } from "./pricing"

export interface OperationContext {
  timestamp: string
  orderId: string
}

function setAvailability(
  state: ShopState,
  productId: string,
  status: Product["status"],
  timestamp: string,
): ShopState {
  return {
    ...state,
    products: state.products.map((product) =>
      product.id === productId
        ? { ...product, status, updatedAt: timestamp }
        : product,
    ),
  }
}

export function reserveProduct(
  state: ShopState,
  productId: string,
  draft: RentalDraft,
  startImmediately: boolean,
  context: OperationContext,
): ShopState {
  const product = state.products.find((item) => item.id === productId)
  if (
    !product ||
    product.status !== "available" ||
    state.orders.some(
      (order) =>
        order.id === context.orderId ||
        (order.productId === productId &&
          (order.status === "active" || order.status === "reserved")),
    )
  )
    return state
  if (
    !isDateRangeValid(draft.rentalStartDate, draft.expectedReturnDate) ||
    !Number.isFinite(draft.depositAmount) ||
    draft.depositAmount < 0
  )
    return state
  const days = calendarDays(draft.rentalStartDate, draft.expectedReturnDate)
  const order: RentalOrder = {
    id: context.orderId,
    productId,
    productSnapshot: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      coverUrl: coverUrl(product),
      category: product.category,
    },
    ...draft,
    actualReturnDate: null,
    rentalDays: days,
    firstDayPriceSnapshot: product.firstDayPrice,
    additionalDayPriceSnapshot: product.additionalDayPrice,
    suggestedPrice: suggestedPrice(product, days),
    additionalCharges: 0,
    discount: 0,
    actualRevenue: 0,
    status: startImmediately ? "active" : "reserved",
    createdAt: context.timestamp,
    completedAt: null,
  }
  return setAvailability(
    { ...state, orders: [order, ...state.orders] },
    productId,
    startImmediately ? "rented" : "reserved",
    context.timestamp,
  )
}

export function startRental(
  state: ShopState,
  orderId: string,
  timestamp: string,
  draft?: Partial<RentalDraft>,
): ShopState {
  const target = state.orders.find((order) => order.id === orderId)
  if (!target || target.status !== "reserved") return state
  const updated = { ...target, ...draft }
  if (
    !isDateRangeValid(updated.rentalStartDate, updated.expectedReturnDate) ||
    !Number.isFinite(updated.depositAmount) ||
    updated.depositAmount < 0
  )
    return state
  const days = calendarDays(updated.rentalStartDate, updated.expectedReturnDate)
  const order: RentalOrder = {
    ...updated,
    rentalDays: days,
    suggestedPrice: calculateRentalPrice(
      target.firstDayPriceSnapshot,
      target.additionalDayPriceSnapshot,
      days,
    ),
    status: "active",
  }
  return setAvailability(
    {
      ...state,
      orders: state.orders.map((item) => (item.id === orderId ? order : item)),
    },
    target.productId,
    "rented",
    timestamp,
  )
}

export function cancelReservation(
  state: ShopState,
  orderId: string,
  timestamp: string,
): ShopState {
  const target = state.orders.find((order) => order.id === orderId)
  if (!target || target.status !== "reserved") return state
  return setAvailability(
    {
      ...state,
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order,
      ),
    },
    target.productId,
    "available",
    timestamp,
  )
}

export function completeRental(
  state: ShopState,
  orderId: string,
  draft: CompletionDraft,
  timestamp: string,
): ShopState {
  const target = state.orders.find((order) => order.id === orderId)
  if (
    !target ||
    target.status !== "active" ||
    !isDateRangeValid(target.rentalStartDate, draft.actualReturnDate)
  )
    return state
  if (
    [draft.additionalCharges, draft.discount, draft.actualRevenue].some(
      (value) => !Number.isFinite(value) || value < 0,
    )
  )
    return state
  const days = calendarDays(target.rentalStartDate, draft.actualReturnDate)
  const order: RentalOrder = {
    ...target,
    ...draft,
    rentalDays: days,
    suggestedPrice: calculateRentalPrice(
      target.firstDayPriceSnapshot,
      target.additionalDayPriceSnapshot,
      days,
    ),
    status: "completed",
    completedAt: timestamp,
  }
  return setAvailability(
    {
      ...state,
      orders: state.orders.map((item) => (item.id === orderId ? order : item)),
    },
    target.productId,
    "available",
    timestamp,
  )
}
