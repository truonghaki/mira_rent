import { useShop } from "@/hooks/useShop"
export function useShopSettings() {
  const { settings, saveSettings, resetDemo } = useShop()
  return { settings, saveSettings, resetDemo }
}
