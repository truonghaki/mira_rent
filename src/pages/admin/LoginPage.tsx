import {userMessage} from "@/services/supabase/errors";
import { navigate } from "@/app/router/navigation"
import AdminBrand from "@/components/common/admin/Brand"
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import { photos } from "@/data/photos"
import { validateDemoCredentials } from "@/features/auth/validation"
import { useShop } from "@/hooks/useShop"
import { type FormEvent, useEffect, useState } from "react"

export default function AdminLogin() {
  const { authenticated, login, settings, services } = useShop()
  const [pending,setPending]=useState(false);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    if (authenticated) navigate("/admin", true)
  }, [authenticated])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if(pending)return;
    const validationError = validateDemoCredentials(email, password)
    if (validationError) {
      setError(validationError)
      return
    }
    setPending(true);setError("");
    try {
      await login(email, password)
      navigate("/admin", true)
    } catch(error) {setError(userMessage(error))}finally{setPending(false)}
  }
  return (
    <main className="login-page">
      <section className="login-visual">
        <img src={photos[4]} alt={settings.name} />
        <AdminBrand />
        <blockquote>
          “Vẻ đẹp nở rộ
          <br />
          trong từng khoảnh khắc.”
        </blockquote>
      </section>
      <section className="login-form">
        <form onSubmit={submit}>
          <span className="demo-badge">
            {services.mode === "demo" ? "DEMO MODE · KHÔNG PHẢI XÁC THỰC BẢO MẬT" : "MIRA RENT · QUẢN TRỊ"}
          </span>
          <p className="eyebrow">MIRA RENT · QUẢN TRỊ</p>
          <h1>
            Chào Thảo Hân,
            <br />
            <em>mừng bạn trở lại.</em>
          </h1>
          <p>
            {services.mode === "demo" ? "Phiên đăng nhập mô phỏng được lưu trong session trình duyệt. Có thể thay bằng Supabase Auth sau này." : "Đăng nhập để quản lý cửa hàng của bạn."}
          </p>
          <label>
            Email quản trị
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Mật khẩu
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Tối thiểu 4 ký tự"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <AButton className="primary login-button" type="submit" disabled={pending}>
            Đăng nhập <AIcon name="arrow" />
          </AButton>
          <button
            type="button"
            className="back-site"
            onClick={() => navigate("/")}
          >
            <AIcon name="back" /> Về trang khách hàng
          </button>
        </form>
      </section>
    </main>
  )
}
