import type { ShopState } from "@/types/shop"
type RecordValue = Record<string, unknown>
function isRecord(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
function strings(value: RecordValue, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === "string")
}
function numbers(value: RecordValue, keys: string[]): boolean {
  return keys.every(
    (key) => typeof value[key] === "number" && Number.isFinite(value[key]),
  )
}
function stringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

export function isShopState(value: unknown): value is ShopState {
  if (
    !isRecord(value) ||
    !Array.isArray(value.products) ||
    !Array.isArray(value.orders) ||
    !isRecord(value.settings)
  )
    return false
  if (
    !strings(value.settings, [
      "name",
      "tagline",
      "owner",
      "phone",
      "instagramUrl",
      "zaloUrl",
      "tiktokUrl",
      "address",
    ])
  )
    return false
  if (
    !value.products.every(
      (product: unknown) =>
        isRecord(product) &&
        strings(product, [
          "id",
          "slug",
          "name",
          "description",
          "material",
          "accessories",
          "coverImage",
          "createdAt",
          "updatedAt",
        ]) &&
        numbers(product, [
          "originalPrice",
          "firstDayPrice",
          "additionalDayPrice",
        ]) &&
        ["Áo dài", "Váy", "Khác"].includes(String(product.category)) &&
        ["available", "reserved", "rented"].includes(String(product.status)) &&
        typeof product.isFeatured === "boolean" &&
        stringArray(product.sizes) &&
        stringArray(product.colors) &&
        Array.isArray(product.images) &&
        product.images.every(
          (image: unknown) =>
            isRecord(image) && strings(image, ["id", "url", "name"]),
        ),
    )
  )
    return false
  return value.orders.every(
    (order: unknown) =>
      isRecord(order) &&
      strings(order, [
        "id",
        "productId",
        "customerName",
        "customerPhone",
        "rentalStartDate",
        "expectedReturnDate",
        "notes",
        "createdAt",
      ]) &&
      numbers(order, [
        "rentalDays",
        "firstDayPriceSnapshot",
        "additionalDayPriceSnapshot",
        "suggestedPrice",
        "depositAmount",
        "additionalCharges",
        "discount",
        "actualRevenue",
      ]) &&
      ["reserved", "active", "completed", "cancelled"].includes(
        String(order.status),
      ) &&
      (order.actualReturnDate === null ||
        typeof order.actualReturnDate === "string") &&
      (order.completedAt === null || typeof order.completedAt === "string") &&
      isRecord(order.productSnapshot) &&
      strings(order.productSnapshot, [
        "id",
        "name",
        "slug",
        "coverUrl",
        "category",
      ]),
  )
}
