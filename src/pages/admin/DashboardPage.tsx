import { navigate } from "@/app/router/navigation"
import StatusPill from "@/components/product/AdminStatusPill"
import { availabilityText } from "@/components/product/status-labels"
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import { coverUrl } from "@/features/products/images"
import TransactionList from "@/features/rentals/components/TransactionList"
import Chart from "@/features/revenue/components/Chart"
import { useRevenue } from "@/features/revenue/useRevenue"
import { useShop } from "@/hooks/useShop"
import AdminLayout from "@/layouts/AdminLayout"
import { money } from "@/utils/currency"
import { dateText } from "@/utils/date"

export default function Dashboard() {
  const { products, orders } = useShop()
  const {
    completed,
    thisMonth,
    currentRevenue: revenue,
    series,
    growth,
  } = useRevenue()
  const active = orders.filter(
    (order) => order.status === "reserved" || order.status === "active",
  )
  const values = series.map((entry) => entry.revenue)
  const cards = [
    ["Tổng sản phẩm", products.length],
    [
      "Còn sẵn",
      products.filter((product) => product.status === "available").length,
    ],
    [
      "Đã đặt",
      products.filter((product) => product.status === "reserved").length,
    ],
    [
      "Đang cho thuê",
      products.filter((product) => product.status === "rented").length,
    ],
    ["Doanh thu tháng này", money(revenue)],
    ["Đơn hoàn thành", thisMonth.length],
  ]
  return (
    <AdminLayout
      title="Tổng quan"
      action={
        <div className="title-actions">
          <AButton
            className="button-outline"
            onClick={() => navigate("/admin/rentals")}
          >
            Quản lý đơn
          </AButton>
          <AButton
            className="primary"
            icon="plus"
            onClick={() => navigate("/admin/products/new")}
          >
            Thêm sản phẩm
          </AButton>
        </div>
      }
    >
      <div className="stat-grid stat-grid-six">
        {cards.map(([label, value]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>
              {label === "Doanh thu tháng này"
                ? `${growth}% so với tháng trước`
                : "Dữ liệu trực tiếp"}
            </small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel revenue-panel">
          <div className="panel-title">
            <div>
              <p>DOANH THU 6 THÁNG</p>
              <h2>{money(revenue)} tháng này</h2>
            </div>
            <button onClick={() => navigate("/admin/revenue")}>
              Xem chi tiết <AIcon name="arrow" />
            </button>
          </div>
          <Chart values={values} labels={series.map((entry) => entry.label)} />
        </section>
        <section className="panel attention">
          <div className="panel-title">
            <div>
              <p>ĐƠN ĐANG XỬ LÝ</p>
              <h2>Cần chú ý</h2>
            </div>
            <span className="count">
              {String(active.length).padStart(2, "0")}
            </span>
          </div>
          {active.slice(0, 4).map((order) => (
            <button
              className="mini-order"
              key={order.id}
              onClick={() => navigate("/admin/rentals")}
            >
              <img src={order.productSnapshot.coverUrl} alt="" />
              <div>
                <strong>{order.productSnapshot.name}</strong>
                <span>
                  {order.customerName || "Khách lẻ"} · Trả{" "}
                  {dateText(order.expectedReturnDate)}
                </span>
              </div>
              <StatusPill
                status={order.status === "active" ? "rented" : "reserved"}
              />
            </button>
          ))}
        </section>
      </div>
      <section className="dashboard-activity">
        <article className="panel">
          <div className="panel-title">
            <div>
              <p>SẢN PHẨM MỚI</p>
              <h2>Vừa cập nhật</h2>
            </div>
            <button onClick={() => navigate("/admin/products")}>
              Quản lý <AIcon name="arrow" />
            </button>
          </div>
          {products
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 3)
            .map((product) => (
              <button
                className="activity-product"
                key={product.id}
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              >
                <img src={coverUrl(product)} alt="" />
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {money(product.firstDayPrice)} ·{" "}
                    {availabilityText[product.status]}
                  </small>
                </span>
              </button>
            ))}
        </article>
        <article className="panel activity-summary">
          <div>
            <span className="activity-icon reserved">
              <AIcon name="calendar" />
            </span>
            <p>
              <small>Vừa đặt lịch</small>
              <strong>
                {orders.filter((order) => order.status === "reserved").length}{" "}
                sản phẩm
              </strong>
            </p>
          </div>
          <div>
            <span className="activity-icon rented">
              <AIcon name="bag" />
            </span>
            <p>
              <small>Đang cho thuê</small>
              <strong>
                {orders.filter((order) => order.status === "active").length} sản
                phẩm
              </strong>
            </p>
          </div>
          <AButton
            className="button-outline"
            onClick={() => navigate("/admin/rentals")}
          >
            Quản lý đơn thuê <AIcon name="arrow" />
          </AButton>
        </article>
      </section>
      <section className="panel recent">
        <div className="panel-title">
          <div>
            <p>HOẠT ĐỘNG GẦN ĐÂY</p>
            <h2>Đơn vừa hoàn tất</h2>
          </div>
          <button onClick={() => navigate("/admin/history")}>
            Xem tất cả <AIcon name="arrow" />
          </button>
        </div>
        <TransactionList
          orders={completed
            .slice()
            .sort((a, b) =>
              (b.completedAt || "").localeCompare(a.completedAt || ""),
            )
            .slice(0, 5)}
        />
      </section>
    </AdminLayout>
  )
}
