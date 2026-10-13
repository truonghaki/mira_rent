import type { ImageStorageAdapter } from "@/services/contracts";
import type { ProductImage } from "@/types/product";
import { validateImage } from "@/features/products/images";
import type { MiraClient } from "./client";
import { backendError, BackendError } from "./errors";
import { PRODUCT_BUCKET } from "./read-repository";
export function createImageStorage(client: MiraClient): ImageStorageAdapter {
    const pending = new Map<string, string>();
    const remove = async (id: string) => {
        const path = pending.get(id);
        if (!path)
            return;
        const { error } = await client.storage.from(PRODUCT_BUCKET).remove([path]);
        if (error)
            throw backendError(error);
        pending.delete(id);
    };
    return {
        upload: async (files, context) => {
            if (!context || !/^[0-9a-f-]{36}$/i.test(context.productId))
                throw new BackendError("INVALID_INPUT", "Chưa xác định được sản phẩm để tải ảnh.");
            const uploaded: ProductImage[] = [];
            for (const file of files) {
                const error = validateImage(file);
                if (error)
                    throw new BackendError("INVALID_INPUT", error);
            }
            try {
                for (const file of files) {
                    const id = crypto.randomUUID(), extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
                    const path = `products/${context.productId}/${id}.${extension}`;
                    const { error } = await client.storage.from(PRODUCT_BUCKET).upload(path, file, { upsert: false, contentType: file.type });
                    if (error)
                        throw backendError(error);
                    pending.set(id, path);
                    uploaded.push({ id, name: file.name, url: client.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl, storagePath: path });
                }
                return uploaded;
            }
            catch (error) {
                await Promise.allSettled(uploaded.map(image => remove(image.id)));
                throw backendError(error);
            }
        },
        remove,
        release: (url) => { if (url.startsWith("blob:"))
            URL.revokeObjectURL(url); },
    };
}
