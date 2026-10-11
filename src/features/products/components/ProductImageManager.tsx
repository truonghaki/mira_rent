import AIcon from "@/components/ui/AdminIcon"
import type { useProductEditor } from "../useProductEditor"
type Props = Pick<ReturnType<typeof useProductEditor>, "images" | "cover" | "setCover" | "uploading" | "imageError" | "upload" | "removeImage" | "move" | "errors">
export default function ProductImageManager({
  images,
  cover,
  setCover,
  uploading,
  imageError,
  upload,
  removeImage,
  move,
  errors,
}: Props) {
  return (
    <section className="panel image-editor">
      <div>
        <h2>Hình ảnh sản phẩm</h2>
        <p>
          Ảnh bìa được dùng trên bộ sưu tập. Ảnh tải lên chỉ là URL tạm trong
          Demo Mode.
        </p>
      </div>
      <label className="upload-box">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => upload(e.target.files)}
        />
        <AIcon name="upload" size={28} />
        <strong>
          {uploading ? "Đang xử lý ảnh..." : "Chọn nhiều ảnh từ thiết bị"}
        </strong>
        <span>JPG, PNG, WEBP · Tối đa 8MB / ảnh</span>
      </label>
      {imageError && <p className="form-error">{imageError}</p>}
      {errors.images && <p className="form-error">{errors.images}</p>}
      <div className="image-manager">
        {images.map((image, index) => (
          <article key={image.id} className={cover === image.id ? "cover" : ""}>
            <img src={image.url} alt={image.name} />
            <button
              type="button"
              className="remove-image"
              onClick={() => removeImage(image)}
            >
              <AIcon name="close" size={15} />
            </button>
            <button
              type="button"
              className="cover-choice"
              onClick={() => setCover(image.id)}
            >
              {cover === image.id ? "Ảnh bìa" : "Chọn bìa"}
            </button>
            <div>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ←
              </button>
              <span>{index + 1}</span>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
              >
                →
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="storage-note">
        Demo Storage Adapter: ảnh tải lên dùng Object URL và không được tải lên
        máy chủ. Production cần thay bằng Supabase Storage.
      </div>
    </section>
  )
}
