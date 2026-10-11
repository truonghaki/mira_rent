import { useShop } from "@/hooks/useShop"
export function useProducts() {
  const { products, orders, saveProduct, deleteProduct } = useShop()
  return { products, orders, saveProduct, deleteProduct }
}
