import type { AppServices } from "./contracts";
import { demoServices } from "./demo";
import { readBackendConfig } from "./config";
import { createLazySupabaseServices } from "./supabase/lazy";
let services: AppServices | undefined;
export function getAppServices(): AppServices {
    if (!services) {
        const config = readBackendConfig({ VITE_BACKEND_MODE: import.meta.env?.VITE_BACKEND_MODE, VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY });
        services = config.mode === "demo" ? demoServices : createLazySupabaseServices(config);
    }
    return services;
}
