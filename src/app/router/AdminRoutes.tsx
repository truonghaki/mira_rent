import { navigate } from "@/app/router/navigation"
import AdminLoading from "@/components/common/admin/Loading"
import { useAuth } from "@/features/auth/useAuth"
import Dashboard from "@/pages/admin/DashboardPage"
import HistoryPage from "@/pages/admin/HistoryPage"
import AdminLogin from "@/pages/admin/LoginPage"
import ProductFormPage from "@/pages/admin/ProductEditorPage"
import ProductsPage from "@/pages/admin/ProductsPage"
import RentalsPage from "@/pages/admin/RentalsPage"
import RevenuePage from "@/pages/admin/RevenuePage"
import SettingsPage from "@/pages/admin/SettingsPage"
import { useEffect, useState } from "react"
import { useLocation } from "./useLocation"
import { resolveAdminRoute } from "./admin-routes"

export default function AdminApp() {
  const { authenticated, authLoading } = useAuth()
  const location = useLocation()
  const path = location.pathname
  const route = resolveAdminRoute(path)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!authLoading && !authenticated && path !== "/admin/login")
      navigate("/admin/login", true)
  }, [authenticated, authLoading, path])
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 250)
    return () => window.clearTimeout(timer)
  }, [])
  if (authLoading) return <AdminLoading />;
  if (route.page === "login") return <AdminLogin />
  if (!authenticated) return null
  if (!ready) return <AdminLoading />
  if (route.page === "dashboard") return <Dashboard />
  if (route.page === "products") return <ProductsPage />
  if (route.page === "product-editor")
    return <ProductFormPage key={route.id || "new"} id={route.id} />
  if (route.page === "rentals") return <RentalsPage key={location.search} />
  if (route.page === "history") return <HistoryPage key={location.search} />
  if (route.page === "revenue") return <RevenuePage />
  if (route.page === "settings") return <SettingsPage />
  return <AdminFallback />
}

function AdminFallback() {
  useEffect(() => navigate("/admin", true), [])
  return null
}
