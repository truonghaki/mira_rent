import type { ImageStorageAdapter } from "@/services/contracts"
const objectUrls = new Map<string, string>()
/** Preserves the exported app's temporary-upload demo. Replace with durable Storage. */
export const demoImageStorage: ImageStorageAdapter = {
  upload: async (files) =>
    files.map((file) => {
      const id = `upload-${crypto.randomUUID()}`
      const url = URL.createObjectURL(file)
      objectUrls.set(id, url)
      return { id, url, name: file.name, temporary: true }
    }),
  remove: async (id) => {
    const url = objectUrls.get(id)
    if (url) URL.revokeObjectURL(url)
    objectUrls.delete(id)
  },
  release: (url) => {
    URL.revokeObjectURL(url)
    for (const [id, current] of objectUrls)
      if (current === url) objectUrls.delete(id)
  },
}
