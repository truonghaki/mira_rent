import { navigate } from "@/app/router/navigation"
import { useShopSettings } from "@/features/settings/useShopSettings"

export default function AdminBrand() {
  const { settings } = useShopSettings()
  return (
    <button className="brand" onClick={() => navigate("/admin")}>
      <strong>{settings.name}</strong>
      <span>by {settings.owner}</span>
    </button>
  )
}
