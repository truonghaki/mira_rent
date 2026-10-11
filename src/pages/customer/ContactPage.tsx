import Brand from "@/components/common/customer/Brand"
import Icon from "@/components/ui/Icon"
import { photos } from "@/data/photos"
import { useShopSettings } from "@/features/settings/useShopSettings"

export default function ContactPage() {
  const { settings } = useShopSettings()
  return (
    <main className="contact-page page">
      <div className="contact-photo">
        <img src={photos[9]} alt="Không gian MIRA" />
        <div>
          <p>We are here for you</p>
        </div>
      </div>
      <section>
        <Brand />
        <h1>
          Ghé MIRA
          <br />
          <em>thử đồ nhé nàng</em>
        </h1>
        <div className="contact-list">
          <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
            <Icon name="phone" />
            <span>
              <small>Điện thoại</small>
              <strong>{settings.phone}</strong>
            </span>
            <Icon name="arrow" />
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="pin" />
            <span>
              <small>Địa chỉ</small>
              <strong>{settings.address}</strong>
            </span>
            <Icon name="arrow" />
          </a>
          <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
            <Icon name="heart" />
            <span>
              <small>Instagram</small>
              <strong>@mira_thueaodai</strong>
            </span>
            <Icon name="arrow" />
          </a>
          <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">
            <Icon name="grid" />
            <span>
              <small>TikTok</small>
              <strong>@mira.rent_thuedo</strong>
            </span>
            <Icon name="arrow" />
          </a>
        </div>
        <p className="opening">
          Mở cửa mỗi ngày · 9:00 — 21:00
          <br />
          <span>Nàng nhắn trước để MIRA chuẩn bị mẫu thật chu đáo nhé.</span>
        </p>
      </section>
    </main>
  )
}
