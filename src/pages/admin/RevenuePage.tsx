import TransactionList from "@/features/rentals/components/TransactionList"
import { useRentals } from "@/features/rentals/useRentals"
import {
  filterRevenueOrders,
  sumRevenue,
} from "@/features/revenue/calculations"
import Chart from "@/features/revenue/components/Chart"
import { useRevenue } from "@/features/revenue/useRevenue"
import AdminLayout from "@/layouts/AdminLayout"
import { money } from "@/utils/currency"
import { useState } from "react"

export default function RevenuePage() {
  const { orders } = useRentals()
  const {
    completed,
    currentRevenue,
    previousRevenue,
    annual,
    annualCount,
    average,
    series,
  } = useRevenue()
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const selected = filterRevenueOrders(orders, { month, year, from, to })
  return (
    <AdminLayout title="Doanh thu">
      <div className="analytics-filters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Cả năm</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              Tháng {index + 1}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option>2026</option>
          <option>2025</option>
        </select>
        <label>
          Từ
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Đến
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <div className="revenue-summary revenue-five">
        <article>
          <p>Doanh thu tháng này</p>
          <strong>{money(currentRevenue)}</strong>
          <span>Chỉ tính đơn hoàn thành</span>
        </article>
        <article>
          <p>Tháng trước</p>
          <strong>{money(previousRevenue)}</strong>
          <span>Đối chiếu theo ngày hoàn tất</span>
        </article>
        <article>
          <p>Doanh thu năm nay</p>
          <strong>{money(annual)}</strong>
          <span>{annualCount} đơn</span>
        </article>
        <article>
          <p>Tổng đơn hoàn thành</p>
          <strong>{completed.length}</strong>
          <span>Không tính đơn hủy</span>
        </article>
        <article>
          <p>Trung bình mỗi đơn</p>
          <strong>{money(average)}</strong>
          <span>Doanh thu thực tế</span>
        </article>
      </div>
      <div className="dashboard-grid">
        <section className="panel revenue-large">
          <div className="panel-title">
            <div>
              <p>DOANH THU THEO THÁNG</p>
              <h2>6 tháng gần nhất</h2>
            </div>
            <span>Đơn vị: VND</span>
          </div>
          <Chart
            values={series.map((entry) => entry.revenue)}
            labels={series.map((entry) => entry.label)}
          />
        </section>
        <section className="panel comparison">
          <p>SỐ ĐƠN HOÀN THÀNH</p>
          <h2>Xu hướng 6 tháng</h2>
          <Chart
            values={series.map((entry) => entry.count)}
            labels={series.map((entry) => entry.label)}
          />
        </section>
      </div>
      <section className="panel recent">
        <div className="panel-title">
          <div>
            <p>GIAO DỊCH ĐÃ CHỌN</p>
            <h2>
              {selected.length} khoản doanh thu · {money(sumRevenue(selected))}
            </h2>
          </div>
        </div>
        <TransactionList orders={selected} />
      </section>
    </AdminLayout>
  )
}
