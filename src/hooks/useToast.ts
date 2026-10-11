import { consumeAdminToast } from "@/services/notifications"
import { useEffect, useState } from "react"
export function useToast(duration = 2600, consumeQueued = false) {
  // Peek the queued message only in the committed effect; StrictMode runs initializers twice.
  const [toast, setToast] = useState("")
  useEffect(() => {
    if (consumeQueued) {
      const message = consumeAdminToast()
      if (message) setToast(message)
    }
  }, [consumeQueued])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), duration)
    return () => window.clearTimeout(timer)
  }, [toast, duration])
  return { toast, setToast }
}
