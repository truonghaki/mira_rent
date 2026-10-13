import {useShop} from "@/hooks/useShop";
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import CurrencyInput from "@/components/ui/CurrencyInput"
import Field from "@/components/ui/Field"
import { coverUrl } from "@/features/products/images"
import type { CompletionDraft } from "@/features/rentals/drafts"
import type { Product } from "@/types/product"
import type { RentalOrder } from "@/types/rental"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"
import { useCompletionForm } from "../useCompletionForm"

export default function CompletionSheet({
  product,
  order,
  onClose,
  onSubmit,
}: {
  product: Product
  order: RentalOrder
  onClose: () => void | Promise<void>
  onSubmit: (draft: CompletionDraft) => void
}) {
  const {busy}=useShop();
  const {
    returnDate,
    setReturnDate,
    charges,
    setCharges,
    discount,
    setDiscount,
    revenue,
    notes,
    setNotes,
    error,
    days,
    suggested,
    additionalDays,
    additionalDayCost,
    submit,
    changeRevenue,
  } = useCompletionForm(order, onSubmit)
  return (
    <div className="overlay admin-modal-overlay" onClick={onClose}>
      <form
        className="admin-modal completion-modal"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="modal-head">
          <div>
            <p>XÁC NHẬN TRẢ ĐỒ</p>
            <h2>Hoàn tất đơn thuê</h2>
          </div>
          <AButton className="icon-button" aria-label="Đóng" onClick={onClose}>
            <AIcon name="close" />
          </AButton>
        </div>
        <div className="completion-product">
          <img src={coverUrl(product)} alt="" />
          <div>
            <strong>{product.name}</strong>
            <span>
              {order.customerName || "Khách lẻ"} ·{" "}
              {dateText(order.rentalStartDate)} —{" "}
              {dateText(order.expectedReturnDate)}
            </span>
            <small>
              {days} ngày thuê · Cọc {money(order.depositAmount)} không tính vào
              doanh thu
            </small>
          </div>
        </div>
        <div className="completion-pricing">
          <div>
            <span>Ngày đầu</span>
            <strong>{money(order.firstDayPriceSnapshot)}</strong>
          </div>
          <div>
            <span>{additionalDays} ngày thêm</span>
            <strong>{money(additionalDayCost)}</strong>
          </div>
          <div>
            <span>Tiền thuê dự kiến</span>
            <strong>{money(suggested)}</strong>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Ngày trả thực tế">
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </Field>
          <Field label="Phụ phí">
            <CurrencyInput value={charges} onChange={setCharges} />
          </Field>
          <Field label="Giảm giá">
            <CurrencyInput value={discount} onChange={setDiscount} />
          </Field>
          <Field label="Doanh thu thực tế *">
            <CurrencyInput value={revenue} onChange={changeRevenue} />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tình trạng trang phục, lưu ý..."
          />
        </Field>
        {error && <p className="form-error">{error}</p>}
        <div className="preserve-note">
          <AIcon name="check" />
          <span>
            Đơn hoàn thành được lưu một lần vào lịch sử. Doanh thu chỉ lấy từ
            bản ghi này, không bao gồm tiền cọc.
          </span>
        </div>
        <div className="modal-actions">
          <AButton className="button-outline" onClick={onClose}>
            Quay lại
          </AButton>
          <AButton className="primary" type="submit" disabled={busy}>
            Xác nhận hoàn tất
          </AButton>
        </div>
      </form>
    </div>
  )
}
