import CurrencyInput from "@/components/ui/CurrencyInput"
import Field from "@/components/ui/Field"
import type { Product, ProductAvailability } from "@/types/product"
import type { useProductEditor } from "../useProductEditor"
type Props = Pick<ReturnType<typeof useProductEditor>, "form" | "errors" | "update">
export default function ProductFields({ form, errors, update }: Props) {
  return (
    <section className="panel editor-fields">
      <h2>Thông tin sản phẩm</h2>
      <div className="form-grid">
        <Field label="Tên sản phẩm *" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="VD: Áo dài Chouchou"
          />
        </Field>
        <Field label="Danh mục">
          <select
            value={form.category}
            onChange={(e) =>
              update("category", e.target.value as Product["category"])
            }
          >
            <option>Áo dài</option>
            <option>Váy</option>
            <option>Khác</option>
          </select>
        </Field>
        <Field label="Giá gốc">
          <CurrencyInput
            value={form.originalPrice}
            onChange={(value) => update("originalPrice", value)}
          />
        </Field>
        <Field label="Giá thuê ngày đầu *" error={errors.firstDayPrice}>
          <CurrencyInput
            value={form.firstDayPrice}
            onChange={(value) => update("firstDayPrice", value)}
          />
        </Field>
        <Field
          label="Giá mỗi ngày tiếp theo *"
          error={errors.additionalDayPrice}
        >
          <CurrencyInput
            value={form.additionalDayPrice}
            onChange={(value) => update("additionalDayPrice", value)}
          />
        </Field>
        <Field label="Trạng thái">
          <select
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value as ProductAvailability)
            }
          >
            <option value="available">Chưa thuê</option>
            <option value="reserved">Đã đặt</option>
            <option value="rented">Đã thuê</option>
          </select>
        </Field>
        <Field label="Size, cách nhau bằng dấu phẩy">
          <input
            value={form.sizes}
            onChange={(e) => update("sizes", e.target.value)}
            placeholder="S, M, L"
          />
        </Field>
        <Field label="Màu sắc">
          <input
            value={form.colors}
            onChange={(e) => update("colors", e.target.value)}
            placeholder="Hồng phấn"
          />
        </Field>
        <Field label="Chất liệu">
          <input
            value={form.material}
            onChange={(e) => update("material", e.target.value)}
            placeholder="Lụa tơ mềm"
          />
        </Field>
        <Field label="Phụ kiện đi kèm">
          <input
            value={form.accessories}
            onChange={(e) => update("accessories", e.target.value)}
            placeholder="Mấn đồng điệu"
          />
        </Field>
      </div>
      <Field label="Mô tả sản phẩm">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Đôi lời về thiết kế..."
        />
      </Field>
      <label className="toggle-row">
        <span>
          <strong>Sản phẩm nổi bật</strong>
          <small>Hiển thị ưu tiên trên trang chủ</small>
        </span>
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => update("isFeatured", e.target.checked)}
        />
        <i />
      </label>
    </section>
  )
}
