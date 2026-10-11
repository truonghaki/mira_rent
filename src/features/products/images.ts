import type { Product } from "@/types/product"

export function coverUrl(item: Product) {
  return (
    item.images.find((image) => image.id === item.coverImage)?.url ||
    item.images[0]?.url ||
    ""
  )
}

export function validateImage(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP."
  if (file.size > 8 * 1024 * 1024) return "Mỗi ảnh cần nhỏ hơn 8MB."
  return null
}

export function reorderImages<T>(
  images: T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction
  if (
    target < 0 ||
    target >= images.length ||
    index < 0 ||
    index >= images.length
  )
    return images
  const next = [...images]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
