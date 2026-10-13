import { useToast } from "@/hooks/useToast"
import type { ProductAvailability } from "@/types/product"
import type { RentalOrder } from "@/types/rental"
import { useMemo, useState } from "react"
import type { RentalAction } from "./types"
import { useRentals } from "./useRentals"
import { resolveRentalRequest } from "./requests"
export function useRentalManagement() {
  const {
    products,
    orders,
    reserveProduct,
    startRental,
    cancelReservation,
    completeRental,
  } = useRentals()
  const {
    product: requestedProduct,
    initialAction,
    cancel: initialCancel,
  } = resolveRentalRequest(products, orders, window.location.search)
  const [tab, setTab] = useState<ProductAvailability>(
    requestedProduct?.status || "reserved",
  )
  const [action, setAction] = useState<RentalAction | null>(initialAction)
  const requestId=useMemo(()=>crypto.randomUUID(),[action]);
  const [cancel, setCancel] = useState<RentalOrder | null>(initialCancel)
  const { toast, setToast } = useToast(2400, true)
  const listed = products.filter((product) => product.status === tab)
  const activeOrder = (productId: string) =>
    orders.find(
      (order) =>
        order.productId === productId &&
        (order.status === "reserved" || order.status === "active"),
    )
  const done = (message: string) => {
    setAction(null)
    setToast(message)
  }
  return {
    requestId,
    products,
    orders,
    reserveProduct,
    startRental,
    cancelReservation,
    completeRental,
    tab,
    setTab,
    action,
    setAction,
    cancel,
    setCancel,
    toast,
    listed,
    activeOrder,
    done,
  }
}
