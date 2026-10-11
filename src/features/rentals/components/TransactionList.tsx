import { navigate } from "@/app/router/navigation"
import Empty from "@/components/ui/Empty"
import type { RentalOrder } from "@/types/rental"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"

export default function TransactionList({ orders }: { orders: RentalOrder[] }) {
  if (!orders.length)
    return (
      <Empty
        title="Chưa có giao dịch"
        copy="Đơn hoàn thành sẽ xuất hiện tại đây."
      />
    )
  return (
    <div className="transaction-list">
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => navigate(`/admin/history?order=${order.id}`)}
        >
          <img src={order.productSnapshot.coverUrl} alt="" />
          <span>
            <strong>{order.productSnapshot.name}</strong>
            <small>
              {order.id} · {dateText(order.completedAt)}
            </small>
          </span>
          <b>{money(order.actualRevenue)}</b>
        </button>
      ))}
    </div>
  )
}
