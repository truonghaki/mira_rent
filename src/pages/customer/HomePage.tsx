import { go } from "@/app/router/navigation"
import GuidePreview from "@/components/common/customer/GuidePreview"
import ProductCard from "@/components/product/ProductCard"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { photos } from "@/data/photos"
import type { Product } from "@/types/product"
import { useEffect, useState } from "react"

export default function Home({ products }: { products: Product[] }) {
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % 3),
      5000,
    )
    return () => window.clearInterval(timer)
  }, [])
  return (
    <main>
      <section className="hero">
        {[photos[0], photos[4], photos[3]].map((photo, index) => (
          <img
            key={photo}
            className={slide === index ? "active" : ""}
            src={photo}
            alt="Nàng thơ MIRA trong tà áo dài"
          />
        ))}
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">Bộ sưu tập xuân · 2026</p>
          <h1>
            Dịu dàng trong
            <br />
            <em>từng khoảnh khắc</em>
          </h1>
          <Button className="button-light" onClick={() => go("collection")}>
            Khám phá bộ sưu tập <Icon name="arrow" />
          </Button>
        </div>
        <div className="hero-pagination">
          {[0, 1, 2].map((item) => (
            <button
              key={item}
              className={slide === item ? "active" : ""}
              onClick={() => setSlide(item)}
            />
          ))}
        </div>
        <div className="hero-note">
          MIRA <i /> 2026
        </div>
      </section>
      <section className="intro section">
        <p className="script">For your beautiful moments</p>
        <h2>
          Khoác lên mình
          <br />
          một chút <em>dịu dàng</em>
        </h2>
        <p>
          Mỗi thiết kế tại MIRA được lựa chọn để nàng cảm thấy thật đặc biệt
          trong những ngày đáng nhớ.
        </p>
      </section>
      <section className="collection section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bộ sưu tập tuyển chọn</p>
            <h2>Nàng thơ MIRA</h2>
          </div>
          <Button className="text-button" onClick={() => go("collection")}>
            Xem tất cả <Icon name="arrow" />
          </Button>
        </div>
        <div className="product-grid">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              large={index === 0}
            />
          ))}
        </div>
      </section>
      <section className="editorial-banner">
        <img src={photos[5]} alt="Áo dài thanh lịch" />
        <div>
          <p className="eyebrow light">MIRA JOURNAL</p>
          <h2>
            Vẻ đẹp không cần
            <br />
            phải vội vàng
          </h2>
          <Button className="button-light" onClick={() => go("process")}>
            Quy trình thuê <Icon name="arrow" />
          </Button>
        </div>
      </section>
      <GuidePreview />
    </main>
  )
}
