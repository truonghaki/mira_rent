import type { Product } from "@/types/product"
import type { ShopState } from "@/types/shop"

export function saveProduct(state: ShopState, product: Product): ShopState {
  const existing = state.products.find((item) => item.id === product.id)
  const nextProduct = { ...product, status: existing?.status || "available" }
  return {
    ...state,
    products: existing
      ? state.products.map((item) =>
          item.id === product.id ? nextProduct : item,
        )
      : [nextProduct, ...state.products],
  }
}

export function canDeleteProduct(
  state: Pick<ShopState, "orders">,
  id: string,
): boolean {
  return !state.orders.some(
    (order) =>
      order.productId === id &&
      (order.status === "reserved" || order.status === "active"),
  )
}

export function deleteProduct(state: ShopState, id: string): ShopState {
  if (!canDeleteProduct(state, id)) return state
  return {
    ...state,
    products: state.products.filter((product) => product.id !== id),
  }
}
