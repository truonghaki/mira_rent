import assert from "node:assert/strict"
import test from "node:test"
import { createDemoState } from "@/services/demo/fixtures"
import {
  reserveProduct,
  startRental,
  cancelReservation,
  completeRental,
} from "@/features/rentals/operations"
import { saveProduct, deleteProduct } from "@/features/products/operations"
import {
  calculateRentalPrice,
  calculateCompletionRevenue,
} from "@/features/rentals/pricing"
import {
  calendarDays,
  isDateRangeValid,
  todayDate,
  nextCalendarDate,
} from "@/utils/date"
import {
  filterRevenueOrders,
  monthlySeries,
  revenueSummary,
  sumRevenue,
} from "@/features/revenue/calculations"
import {
  createProductForm,
  productFromForm,
  validateProductForm,
} from "@/features/products/form"
import { reorderImages, validateImage } from "@/features/products/images"
import { getRentalIntent } from "@/features/rentals/status"
import { filterProducts } from "@/features/products/selectors"

const timestamp = "2026-03-18T12:00:00.000Z"
const draft = {
  customerName: "Khách demo",
  customerPhone: "0900000000",
  rentalStartDate: "2026-03-18",
  expectedReturnDate: "2026-03-20",
  depositAmount: 500000,
  notes: "",
}
const completion = {
  actualReturnDate: "2026-03-20",
  additionalCharges: 50000,
  discount: 10000,
  actualRevenue: 269000,
  notes: "Đã kiểm tra",
}

test("inclusive rental days across leap years and year boundaries", () => {
  assert.equal(calendarDays("2026-03-18", "2026-03-18"), 1)
  assert.equal(calendarDays("2024-02-28", "2024-03-01"), 3)
  assert.equal(calendarDays("2025-12-31", "2026-01-01"), 2)
  assert.equal(isDateRangeValid("2026-02-29", "2026-03-01"), false)
  assert.equal(isDateRangeValid("2026-03-20", "2026-03-18"), false)
})
test("shop calendar date uses Vietnam timezone", () => {
  assert.equal(todayDate(new Date("2026-10-11T19:00:00Z")), "2026-10-12")
  assert.equal(nextCalendarDate("2024-02-28"), "2024-02-29")
})
test("first-day and additional-day pricing with nonnegative completion amount", () => {
  assert.equal(calculateRentalPrice(169000, 30000, 1), 169000)
  assert.equal(calculateRentalPrice(169000, 30000, 3), 229000)
  assert.equal(calculateCompletionRevenue(229000, 50000, 10000), 269000)
  assert.equal(calculateCompletionRevenue(100, 0, 200), 0)
})
test("reservation creates snapshot and atomically reserves product", () => {
  const initial = createDemoState()
  const next = reserveProduct(initial, "1", draft, false, {
    timestamp,
    orderId: "TEST-1",
  })
  assert.equal(initial.products[0].status, "available")
  assert.equal(next.products[0].status, "reserved")
  assert.equal(next.orders[0].rentalDays, 3)
  assert.equal(next.orders[0].suggestedPrice, 229000)
  assert.equal(next.orders[0].actualRevenue, 0)
  assert.equal(next.orders[0].firstDayPriceSnapshot, 169000)
  assert.equal(
    reserveProduct(next, "1", draft, false, { timestamp, orderId: "TEST-2" }),
    next,
  )
})
test("direct rental starts immediately; invalid dates are rejected", () => {
  const state = createDemoState()
  const next = reserveProduct(state, "1", draft, true, {
    timestamp,
    orderId: "TEST-1",
  })
  assert.equal(next.orders[0].status, "active")
  assert.equal(next.products[0].status, "rented")
  assert.equal(
    reserveProduct(
      state,
      "1",
      { ...draft, expectedReturnDate: "2026-03-17" },
      true,
      { timestamp, orderId: "TEST-2" },
    ),
    state,
  )
})
test("rental uses stored prices after catalogue changes", () => {
  const reserved = reserveProduct(createDemoState(), "1", draft, false, {
    timestamp,
    orderId: "TEST-1",
  })
  const updated = saveProduct(reserved, {
    ...reserved.products[0],
    firstDayPrice: 999000,
    additionalDayPrice: 999000,
  })
  const started = startRental(updated, "TEST-1", timestamp, {
    expectedReturnDate: "2026-03-21",
  })
  assert.equal(started.orders[0].suggestedPrice, 259000)
  assert.equal(started.products[0].status, "rented")
})
test("completion preserves manual revenue and cannot be recorded twice", () => {
  const active = reserveProduct(createDemoState(), "1", draft, true, {
    timestamp,
    orderId: "TEST-1",
  })
  const done = completeRental(
    active,
    "TEST-1",
    { ...completion, actualRevenue: 123456 },
    timestamp,
  )
  assert.equal(done.orders[0].actualRevenue, 123456)
  assert.equal(done.orders[0].suggestedPrice, 229000)
  assert.equal(done.products[0].status, "available")
  assert.equal(done.orders[0].completedAt, timestamp)
  assert.equal(completeRental(done, "TEST-1", completion, timestamp), done)
  assert.equal(sumRevenue(done.orders) - sumRevenue(active.orders), 123456)
})
test("completion rejects invalid dates and nonfinite or negative money", () => {
  const active = reserveProduct(createDemoState(), "1", draft, true, {
    timestamp,
    orderId: "TEST-1",
  })
  assert.equal(
    completeRental(
      active,
      "TEST-1",
      { ...completion, actualReturnDate: "2026-03-17" },
      timestamp,
    ),
    active,
  )
  assert.equal(
    completeRental(
      active,
      "TEST-1",
      { ...completion, actualRevenue: NaN },
      timestamp,
    ),
    active,
  )
  assert.equal(
    completeRental(
      active,
      "TEST-1",
      { ...completion, discount: -1 },
      timestamp,
    ),
    active,
  )
})
test("cancelled reservation stays in history and earns no revenue", () => {
  const reserved = reserveProduct(createDemoState(), "1", draft, false, {
    timestamp,
    orderId: "TEST-1",
  })
  const cancelled = cancelReservation(reserved, "TEST-1", timestamp)
  assert.equal(cancelled.products[0].status, "available")
  assert.equal(cancelled.orders[0].status, "cancelled")
  assert.equal(startRental(cancelled, "TEST-1", timestamp), cancelled)
  assert.equal(sumRevenue(cancelled.orders), sumRevenue(reserved.orders))
})
test("delete rejects current rentals and preserves completed snapshots", () => {
  const state = createDemoState()
  assert.equal(deleteProduct(state, "2"), state)
  const next = deleteProduct(state, "1")
  assert.equal(
    next.products.some((p) => p.id === "1"),
    false,
  )
  assert.deepEqual(next.orders, state.orders)
  assert.equal(
    next.orders.find((o) => o.productId === "1")?.productSnapshot.name,
    "Áo dài Chouchou",
  )
})
test("revenue excludes deposits, active rentals and cancelled orders", () => {
  const state = createDemoState()
  assert.equal(sumRevenue(state.orders), 1026000)
  const noisy = state.orders.map((order) =>
    order.status === "completed"
      ? order
      : { ...order, actualRevenue: 10000000 },
  )
  assert.equal(sumRevenue(noisy), 1026000)
  const summary = revenueSummary(noisy, new Date("2026-03-18T12:00:00Z"))
  assert.equal(summary.currentRevenue, 438000)
  assert.equal(summary.previousRevenue, 329000)
  assert.equal(summary.annual, 1026000)
})
test("revenue filters combine month, year, customer and date interval", () => {
  const orders = createDemoState().orders
  assert.equal(
    filterRevenueOrders(orders, { month: "3", year: "2026" }).length,
    2,
  )
  assert.equal(
    filterRevenueOrders(orders, {
      from: "2026-03-10",
      to: "2026-03-18",
      query: "ngọc",
    }).length,
    1,
  )
  const series = monthlySeries(orders, new Date("2026-01-15T12:00:00Z"))
  assert.deepEqual(
    series.map((point) => point.label),
    ["T8", "T9", "T10", "T11", "T12", "T1"],
  )
  assert.equal(series[5].revenue, 259000)
})
test("product form preserves identity and validation messages", () => {
  const product = createDemoState().products[0]
  const form = createProductForm(product)
  assert.deepEqual(validateProductForm(form, product.images), {})
  assert.ok(
    validateProductForm({ ...form, name: "", firstDayPrice: "0" }, []).images,
  )
  const changed = productFromForm(
    { ...form, name: "Áo dài mới", sizes: "S, M, " },
    product.images,
    product.coverImage,
    "new-id",
    timestamp,
    product,
  )
  assert.equal(changed.id, product.id)
  assert.equal(changed.slug, product.slug)
  assert.deepEqual(changed.sizes, ["S", "M"])
})
test("image validation and reordering do not mutate original sequence", () => {
  assert.equal(
    validateImage(new File(["x"], "x.gif", { type: "image/gif" })),
    "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.",
  )
  assert.equal(
    validateImage(new File(["x"], "x.png", { type: "image/png" })),
    null,
  )
  const images = ["a", "b", "c"]
  assert.deepEqual(reorderImages(images, 1, -1), ["b", "a", "c"])
  assert.deepEqual(images, ["a", "b", "c"])
  assert.equal(reorderImages(images, 0, -1), images)
})
test("availability actions retain the existing rental URLs", () => {
  assert.equal(getRentalIntent("available", "reserved"), "reserve")
  assert.equal(getRentalIntent("available", "rented"), "direct")
  assert.equal(getRentalIntent("reserved", "rented"), "start")
  assert.equal(getRentalIntent("reserved", "available"), "cancel")
  assert.equal(getRentalIntent("rented", "available"), "complete")
  assert.equal(getRentalIntent("available", "available"), null)
})

test("metadata CRUD cannot bypass the rental state machine", () => {
  const state = createDemoState()
  const saved = saveProduct(state, {
    ...state.products[1],
    status: "available",
    name: "Updated name",
  })
  assert.equal(saved.products[1].status, "reserved")
  assert.equal(saved.products[1].name, "Updated name")
})
test("customer and admin product filters retain their categories and sort order", () => {
  const products = createDemoState().products
  assert.equal(filterProducts(products, { category: "Váy" }).length, 2)
  assert.equal(filterProducts(products, { category: "Còn sẵn" }).length, 4)
  assert.equal(filterProducts(products, { query: "chouchou" })[0].id, "1")
  const sorted = filterProducts(products, { sort: "price" })
  assert.equal(sorted[0].id, "6")
  assert.equal(products[0].id, "1")
  assert.equal(filterProducts(products, { availability: "reserved" }).length, 2)
})
