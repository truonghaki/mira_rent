interface EmptyProps {
  title: string
  copy: string
}

export default function Empty({ title, copy }: EmptyProps) {
  return (
    <div className="empty">
      <span>♡</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  )
}
