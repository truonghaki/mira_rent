import { initialSettings } from "@/data/settings";
import type { BackendConfig } from "@/services/config";
import type { SupabaseServices } from "@/services/contracts";
/** Keep SDK code out of the initial demo bundle; initialize one live client on demand. */
export function createLazySupabaseServices(config: Extract<BackendConfig, {
    mode: "supabase";
}>, initialize: () => Promise<SupabaseServices> = () => import("./index").then(module => module.createSupabaseServices(config))): SupabaseServices {
    let instance: Promise<SupabaseServices> | undefined;
    const load = () => instance ??= initialize();
    return {
        mode: "supabase",
        initialState: () => ({ products: [], orders: [], settings: { ...initialSettings } }), initialSession: () => false,
        auth: {
            getAccess: async () => (await load()).auth.getAccess(),
            hasSession: async () => (await load()).auth.hasSession(),
            signIn: async (...args) => (await load()).auth.signIn(...args),
            signOut: async () => (await load()).auth.signOut(),
            subscribe: (listener) => {
                let disposed = false, unsubscribe: (() => void) | undefined;
                void load().then(services => { if (!disposed)
                    unsubscribe = services.auth.subscribe(listener); }).catch(() => { });
                return () => { disposed = true; unsubscribe?.(); };
            },
        },
        reads: { load: async (admin) => (await load()).reads.load(admin) },
        commands: {
            saveProduct: async (...args) => (await load()).commands.saveProduct(...args),
            archiveProduct: async (...args) => (await load()).commands.archiveProduct(...args),
            createRental: async (...args) => (await load()).commands.createRental(...args),
            startRental: async (...args) => (await load()).commands.startRental(...args),
            cancelReservation: async (...args) => (await load()).commands.cancelReservation(...args),
            completeRental: async (...args) => (await load()).commands.completeRental(...args),
            saveSettings: async (...args) => (await load()).commands.saveSettings(...args),
        },
        imageStorage: {
            upload: async (...args) => (await load()).imageStorage.upload(...args),
            remove: async (id) => (await load()).imageStorage.remove(id),
            release: (url) => { if (url.startsWith("blob:"))
                URL.revokeObjectURL(url); },
        },
    };
}
