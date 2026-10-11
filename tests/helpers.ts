export function fixedDate() {
  const original = globalThis.Date
  const timestamp = original.parse("2026-03-18T12:00:00.000Z")
  globalThis.Date = new Proxy(original, {
    construct(target, args, newTarget) {
      return Reflect.construct(
        target,
        args.length ? args : [timestamp],
        newTarget,
      )
    },
    get(target, property) {
      return property === "now"
        ? () => timestamp
        : Reflect.get(target, property)
    },
  })
  return () => {
    globalThis.Date = original
  }
}

export function normalizeMarkup(html: string): string {
  // Accessibility annotations are intentionally added, without layout/style changes.
  return html
    .replace(/\saria-[\w-]+="[^"]*"/g, "")
    .replace(/\srole="link"/g, "")
    .replace(/\stabindex="0"/g, "")
}
