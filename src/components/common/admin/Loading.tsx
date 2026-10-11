export default function AdminLoading() {
  return (
    <div className="admin-loading">
      <div className="skeleton skeleton-logo" />
      <div className="skeleton-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="skeleton" key={index} />
          ))}
        </div>
        <div className="skeleton skeleton-chart" />
      </div>
    </div>
  )
}
