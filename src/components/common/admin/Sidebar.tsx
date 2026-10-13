import {useShop} from "@/hooks/useShop";
import { navigate } from "@/app/router/navigation"
import { useLocation } from "@/app/router/useLocation"
import AIcon from "@/components/ui/AdminIcon"
import { useShopSettings } from "@/features/settings/useShopSettings"
import AdminBrand from "./Brand"
import { navItems } from "./navigation-items"
export default function AdminSidebar({
  menu,
  setMenu,
  signOut,
}: {
  menu: boolean
  setMenu: (open: boolean) => void
  signOut: () => void
}) {
  const {services}=useShop();
  const { settings } = useShopSettings()
  const { pathname: path } = useLocation()
  return (
    <aside className={menu ? "open" : ""}>
      <AdminBrand />
      <nav>
        {navItems.map(([href, icon, label]) => (
          <button
            key={href}
            className={
              path === href || (href !== "/admin" && path.startsWith(href))
                ? "active"
                : ""
            }
            onClick={() => {
              navigate(href)
              setMenu(false)
            }}
          >
            <AIcon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="admin-user">
        <span>
          {settings.owner
            .split(" ")
            .map((part) => part[0])
            .slice(-2)
            .join("")}
        </span>
        <div>
          <strong>{settings.owner}</strong>
          <small>{services.mode === "demo" ? "DEMO MODE" : "QUẢN TRỊ"}</small>
        </div>
        <button title="Đăng xuất" onClick={signOut}>
          <AIcon name="logout" />
        </button>
      </div>
    </aside>
  )
}
