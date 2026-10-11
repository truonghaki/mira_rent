import type { Product, ProductImage } from "@/types/product"
import { slugify } from "@/utils/slug"
import type { ProductFormState } from "./types"
export type ProductFormErrors = Partial<Record<keyof ProductFormState | "images", string>>

export function createProductForm(existing?: Product): ProductFormState {
  return existing
    ? {
        name: existing.name,
        category: existing.category,
        originalPrice: String(existing.originalPrice),
        firstDayPrice: String(existing.firstDayPrice),
        additionalDayPrice: String(existing.additionalDayPrice),
        description: existing.description,
        sizes: existing.sizes.join(", "),
        colors: existing.colors.join(", "),
        material: existing.material,
        accessories: existing.accessories,
        status: existing.status,
        isFeatured: existing.isFeatured,
      }
    : {
        name: "",
        category: "Áo dài",
        originalPrice: "",
        firstDayPrice: "",
        additionalDayPrice: "",
        description: "",
        sizes: "",
        colors: "",
        material: "",
        accessories: "",
        status: "available",
        isFeatured: false,
      }
}

export function validateProductForm(
  form: ProductFormState,
  images: ProductImage[],
): ProductFormErrors {
  const errors: ProductFormErrors = {}
  if (!form.name.trim()) errors.name = "Vui lòng nhập tên sản phẩm."
  if (
    !Number.isFinite(Number(form.firstDayPrice)) ||
    Number(form.firstDayPrice) <= 0
  )
    errors.firstDayPrice = "Giá thuê ngày đầu phải lớn hơn 0."
  if (
    !Number.isFinite(Number(form.additionalDayPrice)) ||
    Number(form.additionalDayPrice) <= 0
  )
    errors.additionalDayPrice = "Giá ngày tiếp theo phải lớn hơn 0."
  if (!images.length) errors.images = "Vui lòng thêm ít nhất một ảnh."
  return errors
}

export function productFromForm(
  form: ProductFormState,
  images: ProductImage[],
  cover: string,
  id: string,
  timestamp: string,
  existing?: Product,
): Product {
  const list = (text: string) =>
    text
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  return {
    id: existing?.id || id,
    slug: existing?.slug || slugify(form.name),
    name: form.name.trim(),
    category: form.category,
    originalPrice: Number(form.originalPrice) || 0,
    firstDayPrice: Number(form.firstDayPrice),
    additionalDayPrice: Number(form.additionalDayPrice),
    description: form.description.trim(),
    sizes: list(form.sizes),
    colors: list(form.colors),
    material: form.material.trim(),
    accessories: form.accessories.trim(),
    images,
    coverImage: images.some((image) => image.id === cover)
      ? cover
      : images[0]?.id || "",
    status: existing?.status || "available",
    isFeatured: form.isFeatured,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  }
}
