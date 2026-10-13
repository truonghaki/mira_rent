import {useShop} from "@/hooks/useShop";
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import CurrencyInput from "@/components/ui/CurrencyInput"
import Field from "@/components/ui/Field"
import { coverUrl } from "@/features/products/images"
import type { RentalDraft } from "@/features/rentals/drafts"
import type { RentalAction } from "@/features/rentals/types"
import { money } from "@/utils/currency"
import { useRentalForm } from "../useRentalForm"

export default function RentalSheet({
  action,
  onClose,
  onSubmit,
}: {
  action: RentalAction
  onClose: () => void | Promise<void>
  onSubmit: (draft: RentalDraft) => void
}) {
  const {busy}=useShop();
  const { draft, setDraft, error, submit } = useRentalForm(action, onSubmit)
  return (
    <div className="overlay admin-modal-overlay" onClick={onClose}>
      <form
        className="admin-modal rental-sheet"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="modal-head">
          <div>
            <p>{action.type === "reserve" ? "ĐẶT LỊCH" : "BẮT ĐẦU ĐƠN"}</p>
            <h2>
              {action.type === "reserve"
                ? "Đánh dấu đã đặt"
                : "Xác nhận thuê đồ"}
            </h2>
          </div>
          <AButton className="icon-button" aria-label="Đóng" onClick={onClose}>
            <AIcon name="close" />
          </AButton>
        </div>
        <div className="completion-product">
          <img src={coverUrl(action.product)} alt="" />
          <div>
            <strong>{action.product.name}</strong>
            <span>
              {money(action.product.firstDayPrice)} ngày đầu · +
              {money(action.product.additionalDayPrice)} / ngày
            </span>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Tên khách hàng">
            <input
              value={draft.customerName}
              onChange={(e) =>
                setDraft({ ...draft, customerName: e.target.value })
              }
              placeholder="Có thể để trống"
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              value={draft.customerPhone}
              onChange={(e) =>
                setDraft({ ...draft, customerPhone: e.target.value })
              }
              placeholder="Có thể để trống"
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <input
              type="date"
              required
              value={draft.rentalStartDate}
              onChange={(e) =>
                setDraft({ ...draft, rentalStartDate: e.target.value })
              }
            />
          </Field>
          <Field label="Ngày trả dự kiến">
            <input
              type="date"
              required
              value={draft.expectedReturnDate}
              onChange={(e) =>
                setDraft({ ...draft, expectedReturnDate: e.target.value })
              }
            />
          </Field>
          <Field label="Tiền cọc">
            <CurrencyInput
              value={String(draft.depositAmount || "")}
              onChange={(value) =>
                setDraft({ ...draft, depositAmount: Number(value) })
              }
            />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </Field>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <AButton className="button-outline" onClick={onClose}>
            Hủy
          </AButton>
          <AButton className="primary" type="submit" disabled={busy}>
            {action.type === "reserve" ? "Xác nhận đặt" : "Bắt đầu thuê"}
          </AButton>
        </div>
      </form>
    </div>
  )
}
