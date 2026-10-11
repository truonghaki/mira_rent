import { go } from "@/app/router/navigation"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export default function ProcessPage() {
  const steps = [
    ["heart", "Nhắn MIRA", "Chọn mẫu, size và ngày nàng muốn thuê."],
    ["check", "Đặt cọc giữ lịch", "MIRA xác nhận và giữ riêng trang phục."],
    ["bag", "Nhận trang phục", "Tại shop hoặc ship đến địa chỉ của nàng."],
    ["user", "Tỏa sáng", "Sử dụng trang phục và giữ gìn nhẹ nhàng."],
    ["check", "Trả đồ", "Hoàn cọc sau khi shop kiểm tra trang phục."],
  ] as const
  return (
    <main className="page guide-page">
      <div className="page-title">
        <p className="script">Simple & thoughtful</p>
        <h1>Quy trình thuê đồ</h1>
        <p>MIRA đồng hành để trải nghiệm của nàng thật nhẹ nhàng.</p>
      </div>
      <div className="timeline">
        {steps.map(([icon, title, copy], index) => (
          <article key={title}>
            <div className="step-icon">
              <Icon name={icon} />
              <span>0{index + 1}</span>
            </div>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="soft-note">
        <Icon name="heart" />
        <p>
          <strong>Một lưu ý nhỏ</strong>Hoàn cọc sau khi shop kiểm tra trang
          phục.
        </p>
      </div>
      <Button className="primary" onClick={() => go("contact")}>
        Nhắn MIRA ngay <Icon name="arrow" />
      </Button>
    </main>
  )
}
