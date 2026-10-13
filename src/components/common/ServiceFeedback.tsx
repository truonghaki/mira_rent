import {userMessage} from "@/services/supabase/errors";
import { useShop } from "@/hooks/useShop"
import Toast from "@/components/ui/Toast"
export default function ServiceFeedback() {
  const { serviceError } = useShop()
  return serviceError ? (
    <Toast error message={userMessage(serviceError)} />
  ) : null
}
