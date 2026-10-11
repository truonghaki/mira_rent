import type { Page } from "@/app/router/routes"

export function go(page: Page, id?: string) {
  const publicPaths: Partial<Record<Page, string>> = {
    home: "/",
    collection: "/bo-suu-tap",
    process: "/quy-trinh",
    care: "/luu-y",
    contact: "/lien-he",
  }
  const path = page === "detail" ? `/san-pham/${id}` : publicPaths[page] || "/"
  navigate(path, false, { page, id })
}

export function navigate(
  path: string,
  replace = false,
  state: unknown = {},
): void {
  window.history[replace ? "replaceState" : "pushState"](state, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
  window.scrollTo({ top: 0, behavior: "smooth" })
}
