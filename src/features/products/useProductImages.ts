import {userMessage} from "@/services/supabase/errors";
import type { ImageStorageAdapter } from "@/services/contracts"
import type { ProductImage } from "@/types/product"
import { useEffect, useRef, useState } from "react"
import { reorderImages, validateImage } from "./images"

export function useProductImages(
  initialImages: ProductImage[],
  initialCover: string,
  storage: ImageStorageAdapter,
  productId?: string,
) {
  const [images, setImages] = useState(initialImages)
  const [cover, setCover] = useState(initialCover)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState("")
  const mounted = useRef(true)
  const draftImages = useRef(new Map<string, ProductImage>())
  const committed = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
      for (const image of draftImages.current.values())
        if (!committed.current) void storage.remove(image.id).catch(()=>{})
    }
  }, [storage])
  const upload = async (files: FileList | null) => {
    if (!files || uploading) return
    setImageError("")
    const valid: File[] = []
    for (const file of Array.from(files)) {
      const error = validateImage(file)
      if (error) setImageError(error)
      else valid.push(file)
    }
    if (!valid.length) return
    setUploading(true)
    try {
      const uploaded = await storage.upload(valid,productId ? {productId} : undefined)
      if (!mounted.current) {
        uploaded.forEach((image) => {
          void storage.remove(image.id)
        })
        return
      }
      uploaded.forEach((image) => draftImages.current.set(image.id, image))
      timer.current = setTimeout(() => {
        setImages((current) => [...current, ...uploaded])
        setCover((current) => current || uploaded[0]?.id || "")
        setUploading(false)
      }, 550)
    } catch(error) {
      if (mounted.current) {
        setImageError(userMessage(error))
        setUploading(false)
      }
    }
  }
  const removeImage = (image: ProductImage) => {
    setImages((current) => current.filter((item) => item.id !== image.id))
    // Never revoke a saved URL: completed rental snapshots may still reference it.
    if (draftImages.current.has(image.id)) {
      void storage.remove(image.id)
      draftImages.current.delete(image.id)
    }
    if (cover === image.id)
      setCover(images.find((item) => item.id !== image.id)?.id || "")
  }
  return {
    images,
    cover,
    setCover,
    uploading,
    imageError,
    upload,
    removeImage,
    move: (index: number, direction: -1 | 1) =>
      setImages((current) => reorderImages(current, index, direction)),
    commitImages: () => {
      committed.current = true
    },
    allowCleanup: () => {
      committed.current = false
      if(!mounted.current) {
        for(const image of draftImages.current.values())void storage.remove(image.id).catch(()=>{})
        draftImages.current.clear()
      }
    },
  }
}
