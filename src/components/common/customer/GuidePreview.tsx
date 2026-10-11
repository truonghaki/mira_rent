import { go } from "@/app/router/navigation"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export default function GuidePreview() {
  const steps = [
    ["01", "Chọn mẫu nàng yêu"],
    ["02", "MIRA giữ lịch"],
    ["03", "Nhận đồ & tỏa sáng"],
  ]
  return (
    <section className="guide-preview section">
      <p className="eyebrow">Thật nhẹ nhàng</p>
      <h2>Thuê đồ tại MIRA</h2>
      <div className="preview-steps">
        {steps.map(([number, label]) => (
          <div key={number}>
            <span>{number}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <Button className="button-outline" onClick={() => go("process")}>
        Xem quy trình đầy đủ <Icon name="arrow" />
      </Button>
    </section>
  )
}
