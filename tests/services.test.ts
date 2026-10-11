import assert from "node:assert/strict"
import test from "node:test"
import {
  BrowserStorage,
  demoLocalStorage,
} from "@/services/demo/browser-storage"
import { demoRepository, DEMO_STORAGE_KEY } from "@/services/demo/repository"
import { createDemoState } from "@/services/demo/fixtures"
import { isShopState } from "@/services/demo/validation"
import { demoAuth } from "@/services/demo/auth"
import { consumeAdminToast, queueAdminToast } from "@/services/notifications"
import { demoImageStorage } from "@/services/demo/image-storage"
import { PersistenceQueue } from "@/services/persistence"
import type { DataRepository } from "@/services/contracts"

test("existing demo schema survives repository round trip", async () => {
  const state = createDemoState()
  state.settings.owner = "Khách kiểm thử"
  await demoRepository.save(state)
  assert.deepEqual(await demoRepository.load(), state)
  await demoRepository.reset()
  assert.equal((await demoRepository.load()).settings.owner, "Thảo Hân")
})
test("malformed storage recovers demo data without exceptions", async () => {
  demoLocalStorage.set(DEMO_STORAGE_KEY, "{broken")
  assert.equal((await demoRepository.load()).products.length, 8)
  demoLocalStorage.set(
    DEMO_STORAGE_KEY,
    JSON.stringify({ products: [], orders: [] }),
  )
  assert.equal((await demoRepository.load()).orders.length, 8)
  await demoRepository.reset()
})
test("schema validation rejects invalid nested records", () => {
  assert.equal(isShopState(createDemoState()), true)
  const bad = createDemoState()
  Reflect.set(bad.products[0], "images", [{}])
  assert.equal(isShopState(bad), false)
})
test("storage-disabled environments keep the current demo session usable", () => {
  const storage = new BrowserStorage("localStorage")
  storage.set("key", "value")
  assert.equal(storage.get("key"), "value")
  storage.remove("key")
  assert.equal(storage.get("key"), null)
})
test("demo login and logout use the auth adapter", async () => {
  await demoAuth.signOut()
  assert.equal(await demoAuth.hasSession(), false)
  await demoAuth.signIn()
  assert.equal(await demoAuth.hasSession(), true)
  await demoAuth.signOut()
  assert.equal(await demoAuth.hasSession(), false)
})
test("cross-route toast is consumed exactly once", () => {
  queueAdminToast("Đã lưu")
  assert.equal(consumeAdminToast(), "Đã lưu")
  assert.equal(consumeAdminToast(), "")
})
test("temporary images have a controlled URL lifecycle", async () => {
  const images = await demoImageStorage.upload([
    new File(["image"], "sample.png", { type: "image/png" }),
  ])
  assert.equal(images.length, 1)
  assert.equal(images[0].temporary, true)
  assert.ok(images[0].url.startsWith("blob:"))
  assert.equal((await fetch(images[0].url)).status, 200)
  await demoImageStorage.remove(images[0].id)
  await assert.rejects(fetch(images[0].url))
})

test("writes finish in order even when repository work is asynchronous", async () => {
  const saved: string[] = []
  let release: (() => void) | undefined
  const repository: DataRepository = {
    load: async () => createDemoState(),
    reset: async () => {},
    save: async (state) => {
      if (state.settings.name === "first")
        await new Promise<void>((resolve) => {
          release = resolve
        })
      saved.push(state.settings.name)
    },
  }
  const queue = new PersistenceQueue(repository)
  const first = createDemoState()
  first.settings.name = "first"
  const second = createDemoState()
  second.settings.name = "second"
  const firstWrite = queue.save(first)
  const secondWrite = queue.save(second)
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(saved, [])
  release?.()
  await Promise.all([firstWrite, secondWrite])
  assert.deepEqual(saved, ["first", "second"])
})
test("a rejected save does not prevent later retry", async () => {
  let attempts = 0
  const repository: DataRepository = {
    load: async () => createDemoState(),
    reset: async () => {},
    save: async () => {
      if (++attempts === 1) throw new Error("temporary failure")
    },
  }
  const queue = new PersistenceQueue(repository)
  await assert.rejects(queue.save(createDemoState()))
  await queue.save(createDemoState())
  assert.equal(attempts, 2)
})
test("reset discards queued snapshots from the previous demo generation", async () => {
  const events: string[] = []
  const repository: DataRepository = {
    load: async () => createDemoState(),
    reset: async () => {
      events.push("reset")
    },
    save: async () => {
      events.push("save")
    },
  }
  const queue = new PersistenceQueue(repository)
  const stale = queue.save(createDemoState())
  const reset = queue.reset()
  await Promise.all([stale, reset])
  assert.deepEqual(events, ["reset"])
})
