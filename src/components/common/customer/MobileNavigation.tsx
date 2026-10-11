import { go } from "@/app/router/navigation"
import type { Page } from "@/app/router/routes"
import Icon from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/icon-paths"

export default function PublicNav({ page }: { page: Page }) {
  const items: [Page, IconName, string][] = [
    ["home", "home", "Trang chủ"],
    ["collection", "grid", "Bộ sưu tập"],
    ["process", "guide", "Hướng dẫn"],
    ["contact", "heart", "Liên hệ"],
  ]
  if (page === "detail") return null
  return (
    <nav className="bottom-nav">
      {items.map(([target, icon, label]) => (
        <button
          className={
            page === target || (page === "care" && target === "process")
              ? "active"
              : ""
          }
          key={target}
          onClick={() => go(target)}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
