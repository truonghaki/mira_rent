const baseUrl = process.argv[2] || "http://localhost:8443"
const routes = [
  "/",
  "/bo-suu-tap",
  "/san-pham/1",
  "/quy-trinh",
  "/luu-y",
  "/lien-he",
  "/admin/login",
  "/admin",
  "/admin/products",
  "/admin/products/new",
  "/admin/products/1/edit",
  "/admin/rentals?product=1&action=reserve",
  "/admin/history?order=MIRA-260312-05",
  "/admin/revenue",
  "/admin/settings",
]
for (const route of routes) {
  const response = await fetch(new URL(route, baseUrl), {
    signal: AbortSignal.timeout(10000),
  })
  const html = await response.text()
  if (!response.ok || !html.includes('id="root"'))
    throw new Error(`Route failed: ${route} (${response.status})`)
}
console.log(
  `HTTP checks passed for ${routes.length} URLs. React route resolution is covered separately by pnpm test.`,
)
