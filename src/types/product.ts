export type ProductAvailability = "available" | "reserved" | "rented"

export interface ProductImage {
  id: string
  url: string
  name: string
  temporary?: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  category: "Áo dài" | "Váy" | "Khác"
  originalPrice: number
  firstDayPrice: number
  additionalDayPrice: number
  description: string
  sizes: string[]
  colors: string[]
  material: string
  accessories: string
  images: ProductImage[]
  coverImage: string
  status: ProductAvailability
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}
