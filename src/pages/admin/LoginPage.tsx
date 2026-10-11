import { navigate } from "@/app/router/navigation"
import AdminBrand from "@/components/common/admin/Brand"
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import { photos } from "@/data/photos"
import { validateDemoCredentials } from "@/features/auth/validation"
import { useShop } from "@/hooks/useShop"
import { type FormEvent, useEffect, useState } from "react"

export default function AdminLogin() {
  const { authenticated, login, settings } = useShop()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    if (authenticated) navigate("/admin", true)
  }, [authenticated])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const validationError = validateDemoCredentials(email, password)
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      await login(email, password)
      navigate("/admin", true)
    } catch {
      setError("Không thể đăng nhập. Vui lòng thử lại.")
    }
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
            DEMO MODE · KHÔNG PHẢI XÁC THỰC BẢO MẬT
          </span>
          <p className="eyebrow">MIRA RENT · QUẢN TRỊ</p>
          <h1>
            Chào Thảo Hân,
            <br />
            <em>mừng bạn trở lại.</em>
          </h1>
          <p>
            Phiên đăng nhập mô phỏng được lưu trong session trình duyệt. Có thể
            thay bằng Supabase Auth sau này.
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
          <AButton className="primary login-button" type="submit">
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
