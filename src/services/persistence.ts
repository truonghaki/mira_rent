import type { DataRepository } from "./contracts"
import type { ShopState } from "@/types/shop"

/** Serialize writes so a slow earlier response cannot overwrite a newer snapshot. */
export class PersistenceQueue {
  private pending: Promise<void> = Promise.resolve()
  private generation = 0
  constructor(private repository: DataRepository) {}
  save(state: ShopState): Promise<void> {
    const generation = this.generation
    this.pending = this.pending
      .catch(() => undefined)
      .then(() =>
        generation === this.generation
          ? this.repository.save(state)
          : undefined,
      )
    return this.pending
  }
  reset(): Promise<void> {
    this.generation++
    this.pending = this.pending
      .catch(() => undefined)
      .then(() => this.repository.reset())
    return this.pending
  }
}
