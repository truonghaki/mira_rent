/** Storage may be disabled or full. Keep the running demo usable in memory. */
export class BrowserStorage {
  private memory = new Map<string, string>()
  constructor(private kind: "localStorage" | "sessionStorage") {}
  get(key: string): string | null {
    if (this.memory.has(key)) return this.memory.get(key) ?? null
    try {
      return globalThis[this.kind]?.getItem(key) ?? null
    } catch {
      return null
    }
  }
  set(key: string, value: string): void {
    this.memory.set(key, value)
    try {
      globalThis[this.kind]?.setItem(key, value)
    } catch {
      /* memory fallback */
    }
  }
  remove(key: string): void {
    this.memory.delete(key)
    try {
      globalThis[this.kind]?.removeItem(key)
    } catch {
      /* memory fallback */
    }
  }
}

export const demoLocalStorage = new BrowserStorage("localStorage")
export const demoSessionStorage = new BrowserStorage("sessionStorage")
