import { navigate } from "@/app/router/navigation"
import AButton from "@/components/ui/AdminButton"
import AIcon from "@/components/ui/AdminIcon"
import ProductFields from "@/features/products/components/ProductFields"
import ProductImageManager from "@/features/products/components/ProductImageManager"
import { useProductEditor } from "@/features/products/useProductEditor"
import AdminLayout from "@/layouts/AdminLayout"
export default function ProductFormPage({ id }: { id?: string }) {
  const editor = useProductEditor(id)
  const { existing, form, errors, update, submit, uploading, submitError, busy } = editor
  return (
    <AdminLayout
      title={existing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      action={
        <AButton
          className="button-outline"
          icon="back"
          onClick={() => navigate("/admin/products")}
        >
          Quay lại
        </AButton>
      }
    >
      <form className="product-editor" onSubmit={submit}>
        {submitError && <p className="form-error">{submitError}</p>}
        <ProductFields form={form} errors={errors} update={update} />
        <ProductImageManager {...editor} />
        <div className="editor-actions">
          <AButton
            className="button-outline"
            onClick={() => navigate("/admin/products")}
          >
            Hủy
          </AButton>
          <AButton className="primary" type="submit" disabled={uploading || busy}>
            Lưu sản phẩm <AIcon name="check" />
          </AButton>
        </div>
      </form>
    </AdminLayout>
  )
}
