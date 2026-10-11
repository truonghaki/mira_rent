import { filterProducts } from "@/features/products/selectors"
import { navigate } from "@/app/router/navigation"
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import Confirm from "@/components/ui/Confirm"
import Empty from "@/components/ui/Empty"
import Toast from "@/components/ui/Toast"
import { coverUrl } from "@/features/products/images"
import { canDeleteProduct } from "@/features/products/operations"
import { getRentalIntent } from "@/features/rentals/status"
import { useProducts } from "@/features/products/useProducts"
import { useToast } from "@/hooks/useToast"
import AdminLayout from "@/layouts/AdminLayout"
import type { Product, ProductAvailability } from "@/types/product"
import { money } from "@/utils/currency"
import { useMemo, useState } from "react"

export default function ProductsPage() {
  const { products, orders, deleteProduct } = useProducts()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | ProductAvailability>("all")
  const [sort, setSort] = useState<"recent" | "name" | "price">("recent")
  const [deleting, setDeleting] = useState<Product | null>(null)
  const { toast, setToast } = useToast(2600, true)
  const listed = useMemo(
    () => filterProducts(products, { query, availability: filter, sort }),
    [products, query, filter, sort],
  )
  const changeStatus = (product: Product, status: ProductAvailability) => {
    if (status === product.status) return
    const transition = getRentalIntent(product.status, status)
    navigate(
      `/admin/rentals?product=${encodeURIComponent(product.id)}&action=${transition}`,
    )
  }
  const remove = () => {
    if (!deleting) return
    if (!canDeleteProduct({ orders }, deleting.id)) {
      setDeleting(null)
      setToast("Không thể xóa sản phẩm đang có đơn đặt hoặc đang thuê.")
      return
    }
    deleteProduct(deleting.id)
    setDeleting(null)
    setToast("Đã xóa sản phẩm. Lịch sử thuê vẫn được giữ nguyên.")
  }
  return (
    <AdminLayout
      title="Sản phẩm"
      action={
        <AButton
          className="primary"
          icon="plus"
          onClick={() => navigate("/admin/products/new")}
        >
          Thêm sản phẩm
        </AButton>
      }
    >
      <div className="admin-toolbar product-toolbar">
        <div className="search-field">
          <AIcon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
          />
        </div>
        <div className="chips">
          {([
            ["all", "Tất cả"],
            ["available", "Chưa thuê"],
            ["reserved", "Đã đặt"],
            ["rented", "Đã thuê"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "recent" | "name" | "price")
          }
        >
          <option value="recent">Mới thêm gần đây</option>
          <option value="name">Tên sản phẩm</option>
          <option value="price">Giá thuê tăng dần</option>
        </select>
      </div>
      <section className="admin-products-list product-table-v2">
        {listed.map((product) => (
          <article key={product.id}>
            <img src={coverUrl(product)} alt={product.name} />
            <div className="admin-product-name">
              <strong>{product.name}</strong>
              <span>
                {product.category} · {product.sizes.join(", ")}
              </span>
            </div>
            <div className="price-stack">
              <small>Giá gốc {money(product.originalPrice)}</small>
              <strong>{money(product.firstDayPrice)}</strong>
              <small>+{money(product.additionalDayPrice)} / ngày</small>
            </div>
            <select
              className={`status-select ${product.status}`}
              value={product.status}
              onChange={(e) =>
                changeStatus(product, e.target.value as ProductAvailability)
              }
            >
              <option value="available">Chưa thuê</option>
              <option value="reserved">Đã đặt</option>
              <option value="rented">Đã thuê</option>
            </select>
            <div className="quick-actions">
              <button
                title="Xem trang khách hàng"
                onClick={() => navigate(`/san-pham/${product.id}`)}
              >
                <AIcon name="eye" />
              </button>
              <button
                title="Chỉnh sửa"
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              >
                <AIcon name="edit" />
              </button>
              <button title="Xóa" onClick={() => setDeleting(product)}>
                <AIcon name="trash" />
              </button>
            </div>
          </article>
        ))}
      </section>
      {!listed.length && (
        <Empty
          title="Không tìm thấy sản phẩm"
          copy="Thử thay đổi từ khóa hoặc bộ lọc."
        />
      )}
      {deleting && (
        <Confirm
          title="Xóa sản phẩm?"
          copy={`“${deleting.name}” sẽ bị xóa khỏi bộ sưu tập. Các ảnh chụp và đơn thuê lịch sử vẫn được giữ trong bản ghi đơn.`}
          confirm="Xóa sản phẩm"
          destructive
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
      {toast && <Toast message={toast} />}
    </AdminLayout>
  )
}
