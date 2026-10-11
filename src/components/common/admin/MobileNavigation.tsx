import { navigate } from "@/app/router/navigation"
import { useLocation } from "@/app/router/useLocation"
import AIcon from "@/components/ui/AdminIcon"
import { navItems } from "./navigation-items"
export default function AdminMobileNavigation() {
  const { pathname: path } = useLocation()
  return (
    <nav className="admin-bottom">
      {navItems.slice(0, 5).map(([href, icon, label]) => (
        <button
          key={href}
          className={path === href ? "active" : ""}
          onClick={() => navigate(href)}
        >
          <AIcon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
