import type { DemoServices } from "@/services/contracts"
import { demoAuth, readDemoSession } from "./auth"
import { demoImageStorage } from "./image-storage"
import { demoRepository, readDemoState } from "./repository"
export const demoServices: DemoServices = {
  mode: "demo",
  repository: demoRepository,
  auth: demoAuth,
  imageStorage: demoImageStorage,
  initialState: readDemoState,
  initialSession: readDemoSession,
}
