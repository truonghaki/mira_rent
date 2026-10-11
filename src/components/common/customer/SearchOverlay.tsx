import { filterProducts } from "@/features/products/selectors"
import { go } from "@/app/router/navigation"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { coverUrl } from "@/features/products/images"
import type { Product } from "@/types/product"
import { money } from "@/utils/currency"
import { useState } from "react"

export default function SearchOverlay({
  open,
  onClose,
  products,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
}) {
  const [query, setQuery] = useState("")
  if (!open) return null
  const matches = filterProducts(products, { query, limit: 4 })
  return (
    <div className="overlay search-overlay" onClick={onClose}>
      <section
        className="search-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="search-top">
          <div className="search-field">
            <Icon name="search" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên trang phục..."
            />
          </div>
          <Button className="icon-button" aria-label="Đóng" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>
        <p className="eyebrow">Gợi ý dành cho nàng</p>
        <div className="search-results">
          {matches.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onClose()
                go("detail", product.id)
              }}
            >
              <img src={coverUrl(product)} alt="" />
              <span>
                <strong>{product.name}</strong>
                <small>{money(product.firstDayPrice)} / ngày đầu</small>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
