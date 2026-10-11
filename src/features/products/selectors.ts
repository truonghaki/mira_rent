import type { Product, ProductAvailability } from "@/types/product"
export interface ProductFilters {
  query?: string
  category?: string
  availability?: "all" | ProductAvailability
  sort?: "recent" | "name" | "price"
  limit?: number
}
export function filterProducts(
  products: Product[],
  filters: ProductFilters = {},
): Product[] {
  const listed = products.filter(
    (product) =>
      (!filters.query ||
        product.name.toLowerCase().includes(filters.query.toLowerCase())) &&
      (!filters.category ||
        filters.category === "Tất cả" ||
        product.category === filters.category ||
        (filters.category === "Còn sẵn" && product.status === "available")) &&
      (!filters.availability ||
        filters.availability === "all" ||
        product.status === filters.availability),
  )
  if (filters.sort)
    listed.sort((a, b) =>
      filters.sort === "name"
        ? a.name.localeCompare(b.name, "vi")
        : filters.sort === "price"
          ? a.firstDayPrice - b.firstDayPrice
          : b.createdAt.localeCompare(a.createdAt),
    )
  return filters.limit === undefined ? listed : listed.slice(0, filters.limit)
}
