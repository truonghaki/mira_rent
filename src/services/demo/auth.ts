import type { AuthAdapter } from "@/services/contracts"
import { demoSessionStorage } from "./browser-storage"
const SESSION_KEY = "mira-demo-session"
export const readDemoSession = (): boolean =>
  demoSessionStorage.get(SESSION_KEY) === "active"
export const demoAuth: AuthAdapter = {
  signIn: async () => {
    demoSessionStorage.set(SESSION_KEY, "active")
  },
  signOut: async () => {
    demoSessionStorage.remove(SESSION_KEY)
  },
  hasSession: async () => readDemoSession(),
}
