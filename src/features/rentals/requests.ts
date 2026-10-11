import type { Product } from "@/types/product"
import type { RentalOrder } from "@/types/rental"
import type { RentalAction } from "./types"

export function resolveRentalRequest(
  products: Product[],
  orders: RentalOrder[],
  search: string,
) {
  const params = new URLSearchParams(search)
  const product = products.find((item) => item.id === params.get("product"))
  const order = product
    ? orders.find(
        (item) =>
          item.productId === product.id &&
          (item.status === "reserved" || item.status === "active"),
      )
    : undefined
  const action = params.get("action")
  let initialAction: RentalAction | null = null
  let cancel: RentalOrder | null = null
  if (product) {
    if (
      product.status === "available" &&
      (action === "reserve" || action === "direct")
    )
      initialAction = { type: action, product }
    if (action === "start" && order?.status === "reserved")
      initialAction = { type: "start", product, order }
    if (action === "complete" && order?.status === "active")
      initialAction = { type: "complete", product, order }
    if (action === "cancel" && order?.status === "reserved") cancel = order
  }
  return { product, initialAction, cancel }
}
