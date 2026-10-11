import type { CompletionDraft, RentalDraft } from "@/features/rentals/drafts"
import type { AppServices } from "@/services/contracts"
import type { Product } from "@/types/product"
import type { ShopSettings } from "@/types/settings"
import type { ShopState } from "@/types/shop"
import { createContext } from "react"

export interface ShopContextValue extends ShopState {
  authenticated: boolean
  services: AppServices
  serviceError: Error | null
  saveProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  reserveProduct: (
    productId: string,
    draft: RentalDraft,
    startImmediately?: boolean,
  ) => void
  startRental: (orderId: string, draft?: Partial<RentalDraft>) => void
  cancelReservation: (orderId: string) => void
  completeRental: (orderId: string, draft: CompletionDraft) => void
  saveSettings: (settings: ShopSettings) => void
  login: (email?: string, password?: string) => Promise<void>
  logout: () => Promise<void>
  resetDemo: () => Promise<void>
}
export const ShopContext = createContext<ShopContextValue | null>(null)
