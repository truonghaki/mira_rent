import type { RentalOrder } from "@/types/rental"
import { calendarDays, todayDate } from "@/utils/date"
import { useEffect, useState, type FormEvent } from "react"
import type { CompletionDraft } from "./drafts"
import { calculateCompletionRevenue, calculateRentalPrice } from "./pricing"

export function useCompletionForm(
  order: RentalOrder,
  onSubmit: (draft: CompletionDraft) => void,
) {
  const [returnDate, setReturnDate] = useState(todayDate)
  const [charges, setCharges] = useState("0")
  const [discount, setDiscount] = useState("0")
  const [revenue, setRevenue] = useState(() =>
    String(
      calculateRentalPrice(
        order.firstDayPriceSnapshot,
        order.additionalDayPriceSnapshot,
        calendarDays(order.rentalStartDate, todayDate()),
      ),
    ),
  )
  const [manualRevenue, setManualRevenue] = useState(false)
  const [notes, setNotes] = useState(order.notes)
  const [error, setError] = useState("")
  const days = calendarDays(order.rentalStartDate, returnDate)
  const suggested = calculateRentalPrice(
    order.firstDayPriceSnapshot,
    order.additionalDayPriceSnapshot,
    days,
  )
  const additionalDays = Math.max(0, days - 1)
  const additionalDayCost = additionalDays * order.additionalDayPriceSnapshot
  useEffect(() => {
    if (!manualRevenue)
      setRevenue(
        String(
          calculateCompletionRevenue(
            suggested,
            Number(charges),
            Number(discount),
          ),
        ),
      )
  }, [suggested, charges, discount, manualRevenue])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!returnDate || returnDate < order.rentalStartDate) {
      setError("Ngày trả thực tế không thể trước ngày bắt đầu.")
      return
    }
    if (
      [charges, discount, revenue].some(
        (value) => !Number.isFinite(Number(value)) || Number(value) < 0,
      )
    ) {
      setError("Các khoản tiền phải là số không âm.")
      return
    }
    onSubmit({
      actualReturnDate: returnDate,
      additionalCharges: Number(charges),
      discount: Number(discount),
      actualRevenue: Number(revenue),
      notes,
    })
  }
  return {
    returnDate,
    setReturnDate,
    charges,
    setCharges,
    discount,
    setDiscount,
    revenue,
    notes,
    setNotes,
    error,
    days,
    suggested,
    additionalDays,
    additionalDayCost,
    submit,
    changeRevenue: (value: string) => {
      setRevenue(value)
      setManualRevenue(true)
    },
  }
}
