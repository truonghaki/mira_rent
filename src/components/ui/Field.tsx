export default function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className={error ? "field-error" : ""}>
      {label}
      {children}
      {error && <span>{error}</span>}
    </label>
  )
}
