import Empty from "@/components/ui/Empty"
import { useProducts } from "@/features/products/useProducts"
import CustomerLayout from "@/layouts/CustomerLayout"
import CarePage from "@/pages/customer/CarePage"
import Collection from "@/pages/customer/CollectionPage"
import ContactPage from "@/pages/customer/ContactPage"
import Home from "@/pages/customer/HomePage"
import ProductDetail from "@/pages/customer/ProductDetailPage"
import ProcessPage from "@/pages/customer/RentalGuidePage"
import AdminApp from "./router/AdminRoutes"
import { resolvePage } from "./router/routes"
import { useLocation } from "./router/useLocation"
export default function App() {
  const location = useLocation()
  const { products } = useProducts()
  const route = resolvePage(location.pathname)
  const selected = products.find((p) => p.id === route.id) || products[0]
  if (location.pathname.startsWith("/admin")) return <AdminApp />
  return (
    <CustomerLayout page={route.page}>
      {route.page === "home" && <Home products={products} />}
      {route.page === "collection" && <Collection products={products} />}
      {route.page === "detail" &&
        (selected ? (
          <ProductDetail key={selected.id} product={selected} />
        ) : (
          <main className="page">
            <Empty
              title="Chưa tìm thấy mẫu phù hợp"
              copy="Nàng thử một từ khóa khác nhé."
            />
          </main>
        ))}
      {route.page === "process" && <ProcessPage />}
      {route.page === "care" && <CarePage />}
      {route.page === "contact" && <ContactPage />}
    </CustomerLayout>
  )
}
