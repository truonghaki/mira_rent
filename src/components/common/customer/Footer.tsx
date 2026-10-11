import { go } from "@/app/router/navigation"
import Brand from "@/components/common/customer/Brand"
import { useShopSettings } from "@/features/settings/useShopSettings"

export default function Footer() {
  const { settings } = useShopSettings()
  return (
    <footer>
      <Brand />
      <p>
        Trang phục cho những khoảnh khắc
        <br />
        dịu dàng và đáng nhớ.
      </p>
      <div>
        <button onClick={() => go("process")}>Quy trình thuê</button>
        <button onClick={() => go("care")}>Lưu ý thuê đồ</button>
        <button onClick={() => go("contact")}>Liên hệ MIRA</button>
      </div>
      <small>
        © 2026 {settings.name} · by {settings.owner}
      </small>
    </footer>
  )
}
