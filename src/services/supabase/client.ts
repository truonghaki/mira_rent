import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BackendConfig } from "@/services/config";
import type { Database } from "./database.types";
export type MiraClient = SupabaseClient<Database>;
export function createMiraClient(config: Extract<BackendConfig, {
    mode: "supabase";
}>): MiraClient {
    return createClient<Database>(config.url, config.key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "mira-rent-auth" },
    });
}
