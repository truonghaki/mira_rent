import { ShopContext } from "@/app/providers/ShopContext"
import { useContext } from "react"
export function useShop() {
  const value = useContext(ShopContext)
  if (!value) throw new Error("useShop must be used inside ShopProvider")
  return value
}
