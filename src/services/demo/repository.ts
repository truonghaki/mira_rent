import type { DataRepository } from "@/services/contracts"
import type { ShopState } from "@/types/shop"
import { demoLocalStorage } from "./browser-storage"
import { createDemoState } from "./fixtures"
import { isShopState } from "./validation"

export const DEMO_STORAGE_KEY = "mira-rent-demo-v2"
export function readDemoState(): ShopState {
  try {
    const raw = demoLocalStorage.get(DEMO_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isShopState(parsed) ? parsed : createDemoState()
  } catch {
    return createDemoState()
  }
}

export const demoRepository: DataRepository = {
  load: async () => readDemoState(),
  save: async (state) => {
    demoLocalStorage.set(DEMO_STORAGE_KEY, JSON.stringify(state))
  },
  reset: async () => {
    demoLocalStorage.remove(DEMO_STORAGE_KEY)
  },
}
