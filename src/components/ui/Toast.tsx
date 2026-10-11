import AIcon from "@/components/ui/AdminIcon"

export default function Toast({
  message,
  error = false,
}: {
  message: string
  error?: boolean
}) {
  return (
    <div className={`toast ${error ? "toast-error" : ""}`}>
      <AIcon name={error ? "close" : "check"} />
      {message}
    </div>
  )
}
