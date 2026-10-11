import type { Product, ProductAvailability } from "@/types/product"

export interface ProductFormState {
  name: string
  category: Product["category"]
  originalPrice: string
  firstDayPrice: string
  additionalDayPrice: string
  description: string
  sizes: string
  colors: string
  material: string
  accessories: string
  status: ProductAvailability
  isFeatured: boolean
}
