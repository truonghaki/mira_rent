import assert from "node:assert/strict"
import test from "node:test"
import { resolvePage } from "@/app/router/routes"
import { resolveAdminRoute } from "@/app/router/admin-routes"
import { resolveRentalRequest } from "@/features/rentals/requests"
import { createDemoState } from "@/services/demo/fixtures"
import { go, navigate } from "@/app/router/navigation"
import { validateDemoCredentials } from "@/features/auth/validation"

test("all exported customer URLs retain their page mapping", () => {
  for (const [path, page] of [
    ["/", "home"],
    ["/bo-suu-tap", "collection"],
    ["/quy-trinh", "process"],
    ["/luu-y", "care"],
    ["/lien-he", "contact"],
  ])
    assert.equal(resolvePage(path).page, page)
  assert.deepEqual(resolvePage("/san-pham/1"), { page: "detail", id: "1" })
  assert.equal(resolvePage("/unknown").page, "home")
})
test("admin URL mapping includes editor and existing fallback", () => {
  for (const [path, page] of [
    ["/admin", "dashboard"],
    ["/admin/login", "login"],
    ["/admin/products", "products"],
    ["/admin/rentals", "rentals"],
    ["/admin/history", "history"],
    ["/admin/revenue", "revenue"],
    ["/admin/settings", "settings"],
  ])
    assert.equal(resolveAdminRoute(path).page, page)
  assert.deepEqual(resolveAdminRoute("/admin/products/new"), {
    page: "product-editor",
  })
  assert.deepEqual(resolveAdminRoute("/admin/products/1/edit"), {
    page: "product-editor",
    id: "1",
  })
  assert.equal(resolveAdminRoute("/admin/missing").page, "unknown")
})
test("rental deep links select the matching action and order", () => {
  const { products, orders } = createDemoState()
  for (const [search, type] of [
    ["?product=1&action=reserve", "reserve"],
    ["?product=1&action=direct", "direct"],
    ["?product=2&action=start", "start"],
    ["?product=3&action=complete", "complete"],
  ])
    assert.equal(
      resolveRentalRequest(products, orders, search).initialAction?.type,
      type,
    )
  assert.equal(
    resolveRentalRequest(products, orders, "?product=2&action=cancel").cancel
      ?.status,
    "reserved",
  )
})
test("stale and malformed rental deep links cannot create a phantom action", () => {
  const { products, orders } = createDemoState()
  assert.equal(
    resolveRentalRequest(products, orders, "?product=missing&action=reserve")
      .initialAction,
    null,
  )
  assert.equal(
    resolveRentalRequest(products, orders, "?product=1&action=start")
      .initialAction,
    null,
  )
  assert.equal(
    resolveRentalRequest(products, orders, "?product=3&action=reserve")
      .initialAction,
    null,
  )
  assert.equal(
    resolveRentalRequest(products, orders, "?product=1&action=cancel").cancel,
    null,
  )
})
test("navigation retains query parameters, history state and scroll behavior", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  const originalEvent = Object.getOwnPropertyDescriptor(
    globalThis,
    "PopStateEvent",
  )
  const calls: unknown[][] = []
  const fakeWindow = {
    history: {
      pushState: (...args: unknown[]) => calls.push(["push", ...args]),
      replaceState: (...args: unknown[]) => calls.push(["replace", ...args]),
    },
    dispatchEvent: (event: Event) => calls.push([event.type]),
    scrollTo: (options: unknown) => calls.push(["scroll", options]),
  }
  Object.defineProperty(globalThis, "window", {
    value: fakeWindow,
    configurable: true,
  })
  Object.defineProperty(globalThis, "PopStateEvent", {
    value: Event,
    configurable: true,
  })
  try {
    go("detail", "1")
    assert.deepEqual(calls[0], [
      "push",
      { page: "detail", id: "1" },
      "",
      "/san-pham/1",
    ])
    navigate("/admin/history?order=MIRA-260312-05", true)
    assert.deepEqual(calls[3], [
      "replace",
      {},
      "",
      "/admin/history?order=MIRA-260312-05",
    ])
    assert.deepEqual(calls[1], ["popstate"])
    assert.deepEqual(calls[2], ["scroll", { top: 0, behavior: "smooth" }])
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow)
    else Reflect.deleteProperty(globalThis, "window")
    if (originalEvent)
      Object.defineProperty(globalThis, "PopStateEvent", originalEvent)
    else Reflect.deleteProperty(globalThis, "PopStateEvent")
  }
})
test("demo login validation retains its existing rules", () => {
  assert.ok(validateDemoCredentials("bad", "1234"))
  assert.ok(validateDemoCredentials("admin@example.com", "123"))
  assert.equal(validateDemoCredentials("admin@example.com", "1234"), null)
})
