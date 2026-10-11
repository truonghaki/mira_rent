import { filterProducts } from "@/features/products/selectors"
import ProductCard from "@/components/product/ProductCard"
import Icon from "@/components/ui/Icon"
import type { Product } from "@/types/product"
import { useState } from "react"

export default function Collection({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("Tất cả")
  const [query, setQuery] = useState("")
  const filtered = filterProducts(products, { category, query })
  return (
    <main className="page collection-page">
      <div className="page-title">
        <p className="script">The MIRA wardrobe</p>
        <h1>Bộ sưu tập</h1>
        <p>Những thiết kế dành riêng cho khoảnh khắc của nàng.</p>
      </div>
      <div className="collection-tools">
        <div className="search-field">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm mẫu nàng yêu..."
          />
        </div>
        <div className="chips">
          {["Tất cả", "Áo dài", "Váy", "Còn sẵn"].map((item) => (
            <button
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="product-grid collection-full">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <span>♡</span>
          <h3>Chưa tìm thấy mẫu phù hợp</h3>
          <p>Nàng thử một từ khóa khác nhé.</p>
        </div>
      )}
    </main>
  )
}
