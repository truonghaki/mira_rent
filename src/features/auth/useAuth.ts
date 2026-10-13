import { useShop } from "@/hooks/useShop"
export function useAuth() {
  const { authenticated, authLoading, login, logout } = useShop()
  return { authenticated, authLoading, login, logout }
}
