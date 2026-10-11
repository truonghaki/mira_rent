import AIcon from "@/components/ui/AdminIcon"
import AdminBrand from "./Brand"
export default function AdminHeader({
  setMenu,
  signOut,
}: {
  setMenu: (open: boolean) => void
  signOut: () => void
}) {
  return (
    <header>
      <button className="mobile-menu" onClick={() => setMenu(true)}>
        <AIcon name="menu" />
      </button>
      <AdminBrand />
      <div>
        <span className="demo-badge">DEMO MODE</span>
        <button className="icon-button" onClick={signOut} title="Đăng xuất">
          <AIcon name="logout" />
        </button>
      </div>
    </header>
  )
}
