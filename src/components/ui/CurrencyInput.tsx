import { money } from "@/utils/currency"

export default function CurrencyInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="currency-input">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="0"
      />
      <span>{value ? money(Number(value)) : "VND"}</span>
    </div>
  )
}
