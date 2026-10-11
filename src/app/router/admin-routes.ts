interface AdminProductEditorRoute {
  page: "product-editor"
  id?: string
}

export type AdminRoute = {
  page: "login" | "dashboard" | "products" | "rentals" | "history" | "revenue" | "settings"
} | AdminProductEditorRoute | { page: "unknown" }

export function resolveAdminRoute(path: string): AdminRoute {
  if (path === "/admin/products/new") return { page: "product-editor" }
  const edit = path.match(/^\/admin\/products\/([^/]+)\/edit$/)
  if (edit) return { page: "product-editor", id: edit[1] }
  const routes = {
    "/admin/login": "login",
    "/admin": "dashboard",
    "/admin/products": "products",
    "/admin/rentals": "rentals",
    "/admin/history": "history",
    "/admin/revenue": "revenue",
    "/admin/settings": "settings",
  } as const
  return path in routes
    ? { page: routes[(path as keyof typeof routes)] }
    : { page: "unknown" }
}
