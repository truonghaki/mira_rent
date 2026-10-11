import { useShop } from "@/hooks/useShop"
export function useAuth() {
  const { authenticated, login, logout } = useShop()
  return { authenticated, login, logout }
}
