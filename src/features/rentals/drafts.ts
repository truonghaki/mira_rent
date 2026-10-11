export interface RentalDraft {
  customerName: string
  customerPhone: string
  rentalStartDate: string
  expectedReturnDate: string
  depositAmount: number
  notes: string
}

export interface CompletionDraft {
  actualReturnDate: string
  additionalCharges: number
  discount: number
  actualRevenue: number
  notes: string
}
