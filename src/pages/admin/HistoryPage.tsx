import AIcon from "@/components/ui/AdminIcon"
import Empty from "@/components/ui/Empty"
import OrderDetail from "@/features/rentals/components/OrderDetail"
import { useRentals } from "@/features/rentals/useRentals"
import { filterRevenueOrders } from "@/features/revenue/calculations"
import AdminLayout from "@/layouts/AdminLayout"
import type { RentalOrder } from "@/types/rental"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"
import { useState } from "react"

export default function HistoryPage() {
  const { orders } = useRentals()
  const [query, setQuery] = useState("")
  const [month, setMonth] = useState("all")
  const [year, setYear] = useState("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const params = new URLSearchParams(window.location.search)
  const [selected, setSelected] = useState<RentalOrder | null>(
    () => orders.find((order) => order.id === params.get("order")) || null,
  )
  const completed = filterRevenueOrders(orders, {
    query,
    month,
    year,
    from,
    to,
  }).sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
  return (
    <AdminLayout title="Lịch sử thuê">
      <div className="history-filters">
        <div className="search-field">
          <AIcon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sản phẩm hoặc khách hàng..."
          />
        </div>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">Tất cả tháng</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              Tháng {index + 1}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="all">Tất cả năm</option>
          <option>2026</option>
          <option>2025</option>
        </select>
        <label>
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <section className="panel history-list">
        <div className="history-head">
          <span>Trang phục</span>
          <span>Khách hàng</span>
          <span>Thời gian thuê</span>
          <span>Hoàn tất</span>
          <span>Doanh thu</span>
        </div>
        {completed.map((order) => (
          <button
            className="history-row"
            key={order.id}
            onClick={() => setSelected(order)}
          >
            <span className="history-product">
              <img src={order.productSnapshot.coverUrl} alt="" />
              <strong>{order.productSnapshot.name}</strong>
            </span>
            <span>
              {order.customerName || "Khách lẻ"}
              <small>{order.customerPhone || "Không có SĐT"}</small>
            </span>
            <span>
              {dateText(order.rentalStartDate)} —{" "}
              {dateText(order.actualReturnDate)}
              <small>{order.rentalDays} ngày</small>
            </span>
            <span>
              {dateText(order.completedAt)}
              <small>{order.id}</small>
            </span>
            <strong>{money(order.actualRevenue)}</strong>
          </button>
        ))}
      </section>
      {!completed.length && (
        <Empty
          title="Chưa có lịch sử phù hợp"
          copy="Đơn hoàn thành sẽ được lưu vĩnh viễn tại đây."
        />
      )}
      {selected && (
        <OrderDetail order={selected} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  )
}
