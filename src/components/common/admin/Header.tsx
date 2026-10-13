import {useShop} from "@/hooks/useShop";
import AIcon from "@/components/ui/AdminIcon"
import AdminBrand from "./Brand"
export default function AdminHeader({
  setMenu,
  signOut,
}: {
  setMenu: (open: boolean) => void
  signOut: () => void
}) {
  const {services}=useShop();
  return (
    <header>
      <button className="mobile-menu" onClick={() => setMenu(true)}>
        <AIcon name="menu" />
      </button>
      <AdminBrand />
      <div>
        <span className="demo-badge">{services.mode === "demo" ? "DEMO MODE" : "QUẢN TRỊ"}</span>
        <button className="icon-button" onClick={signOut} title="Đăng xuất">
          <AIcon name="logout" />
        </button>
      </div>
    </header>
  )
}
