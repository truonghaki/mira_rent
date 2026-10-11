export type Page = "home" | "collection" | "detail" | "process" | "care" | "contact"

export interface CustomerRoute {
  page: Page
  id?: string
}

export function resolvePage(path = window.location.pathname): CustomerRoute {
  if (path.startsWith("/san-pham/"))
    return { page: "detail", id: path.split("/").pop() }
  const map: Record<string, Page> = {
    "/": "home",
    "/bo-suu-tap": "collection",
    "/quy-trinh": "process",
    "/luu-y": "care",
    "/lien-he": "contact",
  }
  return { page: map[path] || "home" }
}
