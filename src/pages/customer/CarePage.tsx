export default function CarePage() {
  const rules = [
    ["⌁", "Bước đi nhẹ nhàng", "Không giẫm gót giày lên váy."],
    ["◌", "Tránh vết bẩn", "Tránh bùn đất và nước bẩn."],
    ["◇", "Chọn nơi ngồi", "Hạn chế bề mặt thô ráp."],
    ["♧", "Giữ hương vừa đủ", "Không xịt nước hoa trực tiếp."],
    ["♡", "Dùng tiệc cẩn thận", "Tránh đồ ăn, thức uống chạm váy."],
    ["∿", "Treo váy đúng cách", "Treo trang phục sau khi sử dụng."],
  ]
  return (
    <main className="page care-page">
      <div className="page-title">
        <p className="script">With a little care</p>
        <h1>Lưu ý khi nhận váy</h1>
        <p>Để vẻ đẹp được gìn giữ cho nàng và những nàng thơ tiếp theo.</p>
      </div>
      <div className="care-grid">
        {rules.map(([symbol, title, copy]) => (
          <article key={title}>
            <span>{symbol}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <div className="care-wish">
        <i>♡</i>
        <h2>
          Chúc nàng có thật nhiều
          <br />
          khoảnh khắc xinh đẹp
        </h2>
        <p>With love, MIRA RENT</p>
      </div>
    </main>
  )
}
