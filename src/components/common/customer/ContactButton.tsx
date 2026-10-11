import Icon from "@/components/ui/Icon"
import { useShopSettings } from "@/features/settings/useShopSettings"

export default function ContactButton({
  label,
  className = "",
}: {
  label: string
  className?: string
}) {
  const { settings } = useShopSettings()
  const href =
    settings.zaloUrl ||
    settings.instagramUrl ||
    `tel:${settings.phone.replace(/\s/g, "")}`
  return (
    <a
      className={`button primary ${className}`}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {label} <Icon name="arrow" />
    </a>
  )
}
