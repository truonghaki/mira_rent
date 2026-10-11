import { demoSessionStorage } from "./demo/browser-storage"
const TOAST_KEY = "mira-admin-toast"
export function queueAdminToast(message: string): void {
  demoSessionStorage.set(TOAST_KEY, message)
}
export function consumeAdminToast(): string {
  const message = demoSessionStorage.get(TOAST_KEY) || ""
  demoSessionStorage.remove(TOAST_KEY)
  return message
}
