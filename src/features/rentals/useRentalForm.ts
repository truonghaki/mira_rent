import { nextCalendarDate, todayDate } from "@/utils/date"
import { useState, type FormEvent } from "react"
import type { RentalDraft } from "./drafts"
import type { RentalAction } from "./types"
export function useRentalForm(
  action: RentalAction,
  onSubmit: (draft: RentalDraft) => void,
) {
  const source = action.order
  const [draft, setDraft] = useState<RentalDraft>({
    customerName: source?.customerName || "",
    customerPhone: source?.customerPhone || "",
    rentalStartDate: source?.rentalStartDate || todayDate(),
    expectedReturnDate:
      source?.expectedReturnDate || nextCalendarDate(todayDate()),
    depositAmount: source?.depositAmount || 0,
    notes: source?.notes || "",
  })
  const [error, setError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (draft.expectedReturnDate < draft.rentalStartDate) {
      setError("Ngày trả dự kiến không thể trước ngày bắt đầu.")
      return
    }
    onSubmit(draft)
  }
  return { draft, setDraft, error, submit }
}
