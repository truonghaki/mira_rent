import type { ProductImage } from "@/types/product"
import type { ShopState } from "@/types/shop"

/** A write is a complete transaction: an order and availability cannot diverge. */
export interface DataRepository {
  load(): Promise<ShopState>
  save(state: ShopState): Promise<void>
  reset(): Promise<void>
}

export interface AuthAdapter {
  signIn(email?: string, password?: string): Promise<void>
  signOut(): Promise<void>
  hasSession(): Promise<boolean>
}

export interface ImageStorageAdapter {
  upload(files: File[]): Promise<ProductImage[]>
  remove(id: string): Promise<void>
  release(url: string): void
}

export interface AppServices {
  repository: DataRepository
  auth: AuthAdapter
  imageStorage: ImageStorageAdapter
  initialState: () => ShopState
  initialSession: () => boolean
}
