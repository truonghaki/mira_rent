import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import type { RentalOrder } from "@/types/rental"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"

export default function OrderDetail({
  order,
  onClose,
}: {
  order: RentalOrder
  onClose: () => void
}) {
  return (
    <div className="overlay admin-modal-overlay" onClick={onClose}>
      <section
        className="admin-modal order-detail"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p>BẢN GHI {order.id}</p>
            <h2>Chi tiết đơn thuê</h2>
          </div>
          <AButton className="icon-button" aria-label="Đóng" onClick={onClose}>
            <AIcon name="close" />
          </AButton>
        </div>
        <div className="completion-product">
          <img src={order.productSnapshot.coverUrl} alt="" />
          <div>
            <strong>{order.productSnapshot.name}</strong>
            <span>Ảnh chụp sản phẩm được giữ cùng đơn</span>
            <small>Hoàn tất {dateText(order.completedAt)}</small>
          </div>
        </div>
        <div className="detail-record">
          <div>
            <span>Khách hàng</span>
            <strong>{order.customerName || "Khách lẻ"}</strong>
            <small>{order.customerPhone}</small>
          </div>
          <div>
            <span>Thời gian thuê</span>
            <strong>
              {dateText(order.rentalStartDate)} —{" "}
              {dateText(order.actualReturnDate)}
            </strong>
            <small>{order.rentalDays} ngày</small>
          </div>
          <div>
            <span>Giá ngày đầu</span>
            <strong>{money(order.firstDayPriceSnapshot)}</strong>
          </div>
          <div>
            <span>Giá ngày thêm</span>
            <strong>{money(order.additionalDayPriceSnapshot)}</strong>
          </div>
          <div>
            <span>Tiền thuê dự kiến</span>
            <strong>{money(order.suggestedPrice)}</strong>
          </div>
          <div>
            <span>Phụ phí / giảm giá</span>
            <strong>
              +{money(order.additionalCharges)} / -{money(order.discount)}
            </strong>
          </div>
          <div>
            <span>Tiền cọc (không phải doanh thu)</span>
            <strong>{money(order.depositAmount)}</strong>
          </div>
          <div className="record-revenue">
            <span>Doanh thu thực tế</span>
            <strong>{money(order.actualRevenue)}</strong>
          </div>
        </div>
        {order.notes && (
          <div className="record-notes">
            <strong>Ghi chú</strong>
            <p>{order.notes}</p>
          </div>
        )}
      </section>
    </div>
  )
}
