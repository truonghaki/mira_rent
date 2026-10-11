import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import Field from "@/components/ui/Field"
import Toast from "@/components/ui/Toast"
import { useShopSettings } from "@/features/settings/useShopSettings"
import { useToast } from "@/hooks/useToast"
import AdminLayout from "@/layouts/AdminLayout"
import { type FormEvent, useState } from "react"

export default function SettingsPage() {
  const { settings, saveSettings, resetDemo } = useShopSettings()
  const [form, setForm] = useState(settings)
  const { toast, setToast } = useToast(2200)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    saveSettings(form)
    setToast("Đã lưu cài đặt cửa hàng")
  }
  return (
    <AdminLayout title="Cài đặt">
      <form className="settings-form panel" onSubmit={submit}>
        <div className="settings-intro">
          <h2>Thông tin cửa hàng</h2>
          <p>
            Dữ liệu này được dùng chung trên trang liên hệ, chân trang và các
            nút liên hệ khách hàng.
          </p>
        </div>
        <div className="form-grid">
          <Field label="Tên cửa hàng">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Câu giới thiệu">
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="Tên chủ cửa hàng">
            <input
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Instagram URL">
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) =>
                setForm({ ...form, instagramUrl: e.target.value })
              }
            />
          </Field>
          <Field label="Zalo URL">
            <input
              type="url"
              value={form.zaloUrl}
              onChange={(e) => setForm({ ...form, zaloUrl: e.target.value })}
              placeholder="Chưa cấu hình — cần liên kết đã xác minh"
            />
          </Field>
          <Field label="TikTok URL">
            <input
              type="url"
              value={form.tiktokUrl}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
            />
          </Field>
          <Field label="Địa chỉ">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
        </div>
        <div className="storage-note">
          Demo Settings Adapter: dữ liệu cấu trúc nhỏ được lưu trong
          localStorage của trình duyệt này. Đây không phải lưu trữ production.
        </div>
        <div className="editor-actions">
          <AButton
            className="danger-link"
            onClick={async () => {
              if (window.confirm("Khôi phục toàn bộ dữ liệu demo ban đầu?")) {
                try {
                  await resetDemo()
                  window.location.reload()
                } catch {
                  setToast("Không thể đồng bộ dữ liệu. Vui lòng thử lại.")
                }
              }
            }}
          >
            Khôi phục dữ liệu demo
          </AButton>
          <AButton className="primary" type="submit">
            Lưu cài đặt <AIcon name="check" />
          </AButton>
        </div>
      </form>
      {toast && <Toast message={toast} />}
    </AdminLayout>
  )
}
