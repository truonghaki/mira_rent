import { BackendError } from "./supabase/errors";
export interface BackendEnvironment {
    VITE_BACKEND_MODE?: string;
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
export type BackendConfig = {
    mode: "demo";
} | {
    mode: "supabase";
    url: string;
    key: string;
};
export function readBackendConfig(env: BackendEnvironment): BackendConfig {
    const mode = env.VITE_BACKEND_MODE?.trim() || "demo";
    if (mode === "demo")
        return { mode };
    if (mode !== "supabase")
        throw new BackendError("CONFIGURATION", "VITE_BACKEND_MODE phải là demo hoặc supabase.");
    const url = env.VITE_SUPABASE_URL?.trim() || "";
    const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "";
    let parsed: URL;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new BackendError("CONFIGURATION", "Cần cấu hình URL project Supabase hợp lệ.");
    }
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")))
        throw new BackendError("CONFIGURATION", "URL Supabase cần HTTPS hoặc địa chỉ local.");
    let anonKey = false;
    if (key.split(".").length === 3) {
        try {
            const raw = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const payload: unknown = JSON.parse(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, "=")));
            anonKey = !!payload && typeof payload === "object" && "role" in payload && payload.role === "anon";
        }
        catch { /* invalid legacy key */ }
    }
    if (!key.startsWith("sb_publishable_") && !anonKey)
        throw new BackendError("CONFIGURATION", "Chỉ sử dụng publishable key hoặc anon key trong frontend.");
    return { mode, url: url.replace(/\/$/, ""), key };
}
