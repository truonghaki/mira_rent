import { money } from "@/utils/currency"

export default function Chart({
  values,
  labels,
}: {
  values: number[]
  labels: string[]
}) {
  const max = Math.max(...values, 1)
  return (
    <>
      <div className="bar-chart">
        {values.map((value, index) => (
          <div
            key={`${labels[index]}-${value}`}
            className={index === values.length - 1 ? "active" : ""}
            title={money(value)}
          >
            <i style={{ height: `${Math.max(5, (value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </>
  )
}
