import { useShop } from "@/hooks/useShop"
export function useRentals() {
  const {
    products,
    orders,
    reserveProduct,
    startRental,
    cancelReservation,
    completeRental,
  } = useShop()
  return {
    products,
    orders,
    reserveProduct,
    startRental,
    cancelReservation,
    completeRental,
  }
}
