import { availabilityText } from "@/components/product/status-labels"
import AButton from "@/components/ui/AdminButton"
import Confirm from "@/components/ui/Confirm"
import Empty from "@/components/ui/Empty"
import Toast from "@/components/ui/Toast"
import { coverUrl } from "@/features/products/images"
import CompletionSheet from "@/features/rentals/components/CompletionSheet"
import RentalSheet from "@/features/rentals/components/RentalSheet"
import { useRentalManagement } from "@/features/rentals/useRentalManagement"
import AdminLayout from "@/layouts/AdminLayout"
import type { ProductAvailability } from "@/types/product"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"

export default function RentalsPage() {
  const {
    requestId,
    products,
    reserveProduct,
    startRental,
    cancelReservation,
    completeRental,
    tab,
    setTab,
    action,
    setAction,
    cancel,
    setCancel,
    toast,
    listed,
    activeOrder,
    done,
  } = useRentalManagement()
  return (
    <AdminLayout title="Đơn thuê">
      <div className="segmented rental-tabs">
        {(["available", "reserved", "rented"] as ProductAvailability[]).map(
          (status) => (
            <button
              key={status}
              className={tab === status ? "active" : ""}
              onClick={() => setTab(status)}
            >
              {availabilityText[status]}{" "}
              <span>
                {products.filter((product) => product.status === status).length}
              </span>
            </button>
          ),
        )}
      </div>
      <section className="rental-list rental-list-v2">
        {listed.map((product) => {
          const order = activeOrder(product.id)
          return (
            <article key={product.id}>
              <img src={coverUrl(product)} alt="" />
              <div className="rental-main">
                <strong>{product.name}</strong>
                <span>
                  {order
                    ? `${order.customerName || "Khách lẻ"} · ${dateText(order.rentalStartDate)} — ${dateText(order.expectedReturnDate)}`
                    : "Sẵn sàng nhận lịch thuê"}
                </span>
                {order && (
                  <small>
                    {order.id} · Cọc {money(order.depositAmount)}
                  </small>
                )}
              </div>
              <div className="rental-date">
                <small>{order ? "Ngày trả dự kiến" : "Giá ngày đầu"}</small>
                <strong>
                  {order
                    ? dateText(order.expectedReturnDate)
                    : money(product.firstDayPrice)}
                </strong>
              </div>
              <div className="rental-actions">
                {tab === "available" && (
                  <>
                    <AButton
                      className="button-outline"
                      onClick={() => setAction({ type: "reserve", product })}
                    >
                      Đánh dấu đã đặt
                    </AButton>
                    <button
                      onClick={() => setAction({ type: "direct", product })}
                    >
                      Thuê ngay
                    </button>
                  </>
                )}
                {tab === "reserved" && order && (
                  <>
                    <AButton
                      className="primary"
                      onClick={() =>
                        setAction({ type: "start", product, order })
                      }
                    >
                      Bắt đầu thuê
                    </AButton>
                    <button onClick={() => setCancel(order)}>Hủy đặt</button>
                  </>
                )}
                {tab === "rented" && order && (
                  <AButton
                    className="primary"
                    onClick={() =>
                      setAction({ type: "complete", product, order })
                    }
                  >
                    Hoàn tất đơn
                  </AButton>
                )}
              </div>
            </article>
          )
        })}
      </section>
      {!listed.length && (
        <Empty
          title="Chưa có trang phục"
          copy="Không có sản phẩm ở trạng thái này."
        />
      )}
      {action && action.type !== "complete" && (
        <RentalSheet
          action={action}
          onClose={() => setAction(null)}
          onSubmit={async (draft) => {
            if (action.type === "reserve" || action.type === "direct")
              await reserveProduct(action.product.id, draft, action.type === "direct",requestId)
            if (action.type === "start" && action.order)
              await startRental(action.order.id, draft)
            done(
              action.type === "reserve"
                ? "Đã tạo lịch đặt mới"
                : "Đơn thuê đã bắt đầu",
            )
          }}
        />
      )}
      {action?.type === "complete" && action.order && (
        <CompletionSheet
          product={action.product}
          order={action.order}
          onClose={() => setAction(null)}
          onSubmit={async (draft) => {
            await completeRental(action.order.id, draft)
            done("Đã hoàn tất đơn và ghi nhận doanh thu")
          }}
        />
      )}
      {cancel && (
        <Confirm
          title="Hủy lịch đặt?"
          copy="Đơn sẽ được đánh dấu đã hủy và sản phẩm trở lại trạng thái chưa thuê. Bản ghi vẫn được lưu để đối soát."
          confirm="Xác nhận hủy"
          destructive
          onClose={() => setCancel(null)}
          onConfirm={async () => {
            await cancelReservation(cancel.id)
            setCancel(null)
            done("Đã hủy lịch đặt")
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </AdminLayout>
  )
}
