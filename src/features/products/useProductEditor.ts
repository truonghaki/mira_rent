import { navigate } from "@/app/router/navigation"
import { getRentalIntent } from "@/features/rentals/status"
import { useShop } from "@/hooks/useShop"
import { queueAdminToast } from "@/services/notifications"
import { useState, type FormEvent } from "react"
import {
  createProductForm,
  productFromForm,
  validateProductForm,
  type ProductFormErrors,
} from "./form"
import type { ProductFormState } from "./types"
import { useProductImages } from "./useProductImages"
import { useProducts } from "./useProducts"

export function useProductEditor(id?: string) {
  const { products, saveProduct } = useProducts()
  const { services } = useShop()
  const existing = products.find((product) => product.id === id)
  const [form, setForm] = useState(() => createProductForm(existing))
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const images = useProductImages(
    existing?.images || [],
    existing?.coverImage || "",
    services.imageStorage,
  )
  const update = <K extends keyof ProductFormState,>(
    key: K,
    value: ProductFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (images.uploading) return
    const nextErrors = validateProductForm(form, images.images)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const product = productFromForm(
      form,
      images.images,
      images.cover,
      crypto.randomUUID(),
      new Date().toISOString(),
      existing,
    )
    saveProduct(product)
    images.commitImages()
    queueAdminToast(
      existing ? "Đã lưu thay đổi sản phẩm" : "Đã thêm sản phẩm vào bộ sưu tập",
    )
    const intent = getRentalIntent(product.status, form.status)
    navigate(
      intent
        ? `/admin/rentals?product=${encodeURIComponent(product.id)}&action=${intent}`
        : "/admin/products",
    )
  }
  return { existing, form, errors, update, submit, ...images }
}
