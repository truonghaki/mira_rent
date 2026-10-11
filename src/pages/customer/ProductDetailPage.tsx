import { go } from "@/app/router/navigation"
import ContactButton from "@/components/common/customer/ContactButton"
import StatusPill from "@/components/product/StatusPill"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { coverUrl } from "@/features/products/images"
import { suggestedPrice } from "@/features/rentals/pricing"
import type { Product } from "@/types/product"
import { money } from "@/utils/currency"
import { useState } from "react"

export default function ProductDetail({ product }: { product: Product }) {
  const [photo, setPhoto] = useState(0)
  const [viewer, setViewer] = useState(false)
  return (
    <main className="detail-page">
      <section className="detail-gallery">
        <img
          src={product.images[photo]?.url || coverUrl(product)}
          alt={product.name}
          onClick={() => setViewer(true)}
        />
        <Button
          className="gallery-back icon-button"
          onClick={() => go("collection")}
        >
          <Icon name="back" />
        </Button>
        <Button className="gallery-heart icon-button">
          <Icon name="heart" />
        </Button>
        <button className="image-count" onClick={() => setViewer(true)}>
          {photo + 1} / {product.images.length}
        </button>
        <div className="detail-dots">
          {product.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setPhoto(index)}
              className={photo === index ? "active" : ""}
            />
          ))}
        </div>
      </section>
      <section className="detail-content">
        <div className="detail-title">
          <div>
            <p className="eyebrow">{product.category} · MIRA RENT</p>
            <h1>{product.name}</h1>
          </div>
          <StatusPill status={product.status} />
        </div>
        <div className="detail-price">
          <span>Ngày đầu</span>
          <strong>{money(product.firstDayPrice)}</strong>
          <small>
            Giá gốc <s>{money(product.originalPrice)}</s>
          </small>
        </div>
        <div className="price-example">
          <div>
            <span>1 ngày</span>
            <strong>{money(product.firstDayPrice)}</strong>
          </div>
          <div>
            <span>2 ngày</span>
            <strong>{money(suggestedPrice(product, 2))}</strong>
          </div>
          <div>
            <span>3 ngày</span>
            <strong>{money(suggestedPrice(product, 3))}</strong>
          </div>
        </div>
        <div className="details-grid">
          <div>
            <span>Kích cỡ</span>
            <strong>{product.sizes.join(" · ") || "Liên hệ"}</strong>
          </div>
          <div>
            <span>Màu sắc</span>
            <strong>{product.colors.join(" · ") || "Liên hệ"}</strong>
          </div>
          <div>
            <span>Chất liệu</span>
            <strong>{product.material || "Liên hệ"}</strong>
          </div>
          <div>
            <span>Phụ kiện</span>
            <strong>{product.accessories || "Không kèm"}</strong>
          </div>
        </div>
        <details open>
          <summary>Nàng sẽ yêu điều gì?</summary>
          <p>
            {product.description ||
              "Một thiết kế thanh nhã cho lễ cưới, kỷ yếu và những buổi chụp hình đáng nhớ."}
          </p>
        </details>
        <details>
          <summary>Chính sách thuê & giữ đồ</summary>
          <p>
            MIRA hỗ trợ giữ lịch sau khi nhận cọc. Nàng vui lòng giữ trang phục
            sạch và trả đúng hẹn.
          </p>
        </details>
      </section>
      <div className="contact-dock">
        <div>
          <small>Giá thuê từ</small>
          <strong>{money(product.firstDayPrice)}</strong>
        </div>
        <ContactButton
          label={
            product.status === "available"
              ? "Liên hệ thuê ngay"
              : "Hỏi lịch trống"
          }
          className={product.status !== "available" ? "soft" : ""}
        />
      </div>
      {viewer && (
        <div className="fullscreen-viewer">
          <Button
            className="icon-button"
            aria-label="Đóng"
            onClick={() => setViewer(false)}
          >
            <Icon name="close" />
          </Button>
          <img
            src={product.images[photo]?.url || coverUrl(product)}
            alt={product.name}
          />
          <button
            className="viewer-prev"
            onClick={() =>
              setPhoto(
                (photo - 1 + product.images.length) % product.images.length,
              )
            }
          >
            <Icon name="back" />
          </button>
          <button
            className="viewer-next"
            onClick={() => setPhoto((photo + 1) % product.images.length)}
          >
            <Icon name="arrow" />
          </button>
          <span>
            {photo + 1} / {product.images.length}
          </span>
        </div>
      )}
    </main>
  )
}
