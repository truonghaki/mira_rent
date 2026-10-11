// Compatibility boundary for existing Figma store imports.
export { default as StoreProvider } from "./app/providers/ShopProvider"
export type { CompletionDraft, RentalDraft } from "./features/rentals/drafts"
export { useShop as useStore } from "./hooks/useShop"
export type {
  AuthAdapter,
  DataRepository,
  ImageStorageAdapter,
} from "./services/contracts"
