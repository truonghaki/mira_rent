import { useShop } from "@/hooks/useShop"
import Toast from "@/components/ui/Toast"
export default function ServiceFeedback() {
  const { serviceError } = useShop()
  return serviceError ? (
    <Toast error message="Không thể đồng bộ dữ liệu. Vui lòng thử lại." />
  ) : null
}
