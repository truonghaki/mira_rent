import { go } from "@/app/router/navigation"
import { useShopSettings } from "@/features/settings/useShopSettings"

export default function Brand() {
  const { settings } = useShopSettings()
  return (
    <button className="brand" onClick={() => go("home")}>
      <strong>{settings.name}</strong>
      <span>by {settings.owner}</span>
    </button>
  )
}
