const formatter = new Intl.NumberFormat("vi-VN")
export function formatCurrency(value: number): string {
  return `${formatter.format(value || 0)}đ`
}
export { formatCurrency as money }
