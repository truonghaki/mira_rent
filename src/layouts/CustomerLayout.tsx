import type { Page } from "@/app/router/routes"
import Footer from "@/components/common/customer/Footer"
import Header from "@/components/common/customer/Header"
import PublicNav from "@/components/common/customer/MobileNavigation"
import SearchOverlay from "@/components/common/customer/SearchOverlay"
import { useShop } from "@/hooks/useShop"
import { useState, type ReactNode } from "react"

export default function CustomerLayout({
  page,
  children,
}: {
  page: Page
  children: ReactNode
}) {
  const route = { page }
  const [search, setSearch] = useState(false)
  const { products, settings } = useShop()
  return (
    <div className="public-app">
      {route.page !== "detail" && <Header onSearch={() => setSearch(true)} />}
      {children}
      {route.page !== "detail" && <Footer />}
      <PublicNav page={route.page} />
      <SearchOverlay
        open={search}
        onClose={() => setSearch(false)}
        products={products}
      />
      {(settings.zaloUrl || settings.instagramUrl) && (
        <a
          className="floating-contact"
          href={settings.zaloUrl || settings.instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={settings.zaloUrl ? "Nhắn Zalo" : "Nhắn Instagram"}
        >
          {settings.zaloUrl ? "Z" : "I"}
        </a>
      )}
    </div>
  )
}
