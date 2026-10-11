import { navigate } from "@/app/router/navigation"
import AdminHeader from "@/components/common/admin/Header"
import AdminMobileNavigation from "@/components/common/admin/MobileNavigation"
import AdminSidebar from "@/components/common/admin/Sidebar"
import { useShop } from "@/hooks/useShop"
import { useState } from "react"

export default function AdminLayout({
  children,
  title,
  subtitle = "Quản lý MIRA RENT",
  action,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  const { logout } = useShop()
  const [menu, setMenu] = useState(false)
  const signOut = async () => {
    await logout()
    navigate("/admin/login", true)
  }
  return (
    <div className="admin-shell admin-v2">
      <AdminSidebar menu={menu} setMenu={setMenu} signOut={signOut} />
      {menu && (
        <button
          className="admin-menu-shade"
          onClick={() => setMenu(false)}
          aria-label="Đóng menu"
        />
      )}
      <main className="admin-main">
        <AdminHeader setMenu={setMenu} signOut={signOut} />
        <div className="admin-title">
          <div>
            <p>{subtitle}</p>
            <h1>{title}</h1>
          </div>
          {action}
        </div>
        {children}
      </main>
      <AdminMobileNavigation />
    </div>
  )
}
