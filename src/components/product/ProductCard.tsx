import { go } from "@/app/router/navigation"
import StatusPill from "@/components/product/StatusPill"
import Icon from "@/components/ui/Icon"
import { coverUrl } from "@/features/products/images"
import type { Product } from "@/types/product"
import { money } from "@/utils/currency"

export default function ProductCard({
  product,
  large = false,
}: {
  product: Product
  large?: boolean
}) {
  return (
    <article
      className={`product-card ${large ? "product-card-large" : ""}`}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") go("detail", product.id)
      }}
      onClick={() => go("detail", product.id)}
    >
      <div className="product-image-wrap">
        <img src={coverUrl(product)} alt={product.name} />
        <StatusPill status={product.status} />
        <button className="heart-button" aria-label="Yêu thích">
          <Icon name="heart" size={17} />
        </button>
      </div>
      <div className="product-copy">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <div>
          <strong>{money(product.firstDayPrice)}</strong>
          <span> / ngày đầu</span>
        </div>
      </div>
    </article>
  )
}
