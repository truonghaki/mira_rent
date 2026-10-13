import type { SupabaseServices } from "@/services/contracts";
import { initialSettings } from "@/data/settings";
import type { BackendConfig } from "@/services/config";
import { createMiraClient, type MiraClient } from "./client";
import { createAuthAdapter } from "./auth-adapter";
import { createBackendCommands } from "./commands";
import { createImageStorage } from "./image-storage";
import { createReadRepository } from "./read-repository";
export function createSupabaseServices(config: Extract<BackendConfig, {
    mode: "supabase";
}>, client: MiraClient = createMiraClient(config)): SupabaseServices {
    return { mode: "supabase", auth: createAuthAdapter(client), commands: createBackendCommands(client), reads: createReadRepository(client), imageStorage: createImageStorage(client),
        initialSession: () => false, initialState: () => ({ products: [], orders: [], settings: { ...initialSettings } }) };
}
