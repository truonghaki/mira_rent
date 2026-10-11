import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import snapshots from "./fixtures/render-baseline.json" with { type: "json" }
import App from "@/app/App"
import AppProviders from "@/app/providers/AppProviders"
import LoginPage from "@/pages/admin/LoginPage"
import DashboardPage from "@/pages/admin/DashboardPage"
import ProductsPage from "@/pages/admin/ProductsPage"
import ProductEditorPage from "@/pages/admin/ProductEditorPage"
import RentalsPage from "@/pages/admin/RentalsPage"
import HistoryPage from "@/pages/admin/HistoryPage"
import RevenuePage from "@/pages/admin/RevenuePage"
import SettingsPage from "@/pages/admin/SettingsPage"
import { fixedDate, normalizeMarkup } from "./helpers"
const location = { pathname: "/", search: "" }
let restore: () => void
before(() => {
  restore = fixedDate()
  Object.defineProperty(globalThis, "window", {
    value: { location },
    configurable: true,
  })
})
after(() => {
  restore()
  Reflect.deleteProperty(globalThis, "window")
})
for (const [route, expected] of Object.entries(snapshots)) {
  test(`original markup preserved: ${route}`, () => {
    const [pathname, search] = route.split("?")
    location.pathname = pathname
    location.search = search ? "?" + search : ""
    const pages: Record<string, React.ComponentType> = {
      "/admin/login": LoginPage,
      "/admin": DashboardPage,
      "/admin/products": ProductsPage,
      "/admin/products/new": ProductEditorPage,
      "/admin/rentals": RentalsPage,
      "/admin/history": HistoryPage,
      "/admin/revenue": RevenuePage,
      "/admin/settings": SettingsPage,
    }
    const element =
      pathname === "/admin/products/1/edit"
        ? createElement(ProductEditorPage, { id: "1" })
        : createElement(pages[pathname] || App)
    const actual = normalizeMarkup(
      renderToStaticMarkup(createElement(AppProviders, null, element)),
    )
    if (actual !== expected) {
      let index = 0
      while (
        index < actual.length &&
        index < expected.length &&
        actual[index] === expected[index]
      )
        index++
      assert.fail(
        `Markup differs at ${index}\nExpected: ${expected.slice(Math.max(0, index - 100), index + 180)}\nActual: ${actual.slice(Math.max(0, index - 100), index + 180)}`,
      )
    }
  })
}
