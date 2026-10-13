import {BackendError,userMessage} from "@/services/supabase/errors";
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
  const { services, databaseProductId, busy } = useShop()
  const existing = products.find((product) => product.id === id)
  const [productId]=useState(()=>existing?.id || crypto.randomUUID());
  const [submitError,setSubmitError]=useState("");
  const [form, setForm] = useState(() => createProductForm(existing))
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const images = useProductImages(
    existing?.images || [],
    existing?.coverImage || "",
    services.imageStorage,
    databaseProductId(productId),
  )
  const update = <K extends keyof ProductFormState,>(
    key: K,
    value: ProductFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (images.uploading || busy) return
    const nextErrors = validateProductForm(form, images.images)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const product = productFromForm(
      form,
      images.images,
      images.cover,
      productId,
      new Date().toISOString(),
      existing,
    )
    setSubmitError("");
    // Keep uploads while an in-flight write may commit, even if this form unmounts.
    images.commitImages()
    try { await saveProduct(product) } catch(error) {if(!(error instanceof BackendError && (error.retryable || error.code === "RELOAD_REQUIRED")))images.allowCleanup();setSubmitError(userMessage(error));return}
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
  return { existing, form, errors, update, submit, submitError, busy, ...images }
}
