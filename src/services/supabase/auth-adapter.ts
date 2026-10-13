import type { AdminAccess, SupabaseServices } from "@/services/contracts";
import type { MiraClient } from "./client";
import { backendError, BackendError } from "./errors";
export function createAuthAdapter(client: MiraClient): SupabaseServices["auth"] {
    let lastUserId: string | null = null;
    const getAccess = async (): Promise<AdminAccess> => {
        const { data: session, error: sessionError } = await client.auth.getSession();
        if (sessionError)
            throw backendError(sessionError);
        if (!session.session) {
            lastUserId = null;
            return { signedIn: false, isAdmin: false, userId: null, role: null };
        }
        const { data, error } = await client.rpc("get_admin_access");
        if (error)
            throw backendError(error);
        if (!data || typeof data !== "object" || Array.isArray(data) || typeof data.isAdmin !== "boolean")
            throw new BackendError("INVALID_DATA", "Chưa xác định được quyền quản trị.");
        const role = data.role === "owner" || data.role === "admin" ? data.role : null;
        lastUserId = session.session.user.id;
        return { signedIn: true, isAdmin: data.isAdmin && role !== null, role, userId: session.session.user.id };
    };
    return {
        getAccess,
        hasSession: async () => (await getAccess()).isAdmin,
        signIn: async (email, password) => {
            if (!email || !password)
                throw new BackendError("INVALID_INPUT", "Vui lòng nhập email và mật khẩu.");
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error)
                throw backendError(error);
            if (!(await getAccess()).isAdmin) {
                await client.auth.signOut();
                throw new BackendError("ADMIN_REQUIRED", "Tài khoản không có quyền quản trị cửa hàng.");
            }
        },
        signOut: async () => { const { error } = await client.auth.signOut({ scope: "local" }); if (error)
            throw backendError(error); },
        subscribe: (listener) => {
            const timers = new Set<ReturnType<typeof setTimeout>>();
            const { data } = client.auth.onAuthStateChange((event, session) => {
                if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || (event === "SIGNED_IN" && session?.user.id === lastUserId))
                    return;
                const timer = setTimeout(() => { timers.delete(timer); listener(); }, 0);
                timers.add(timer);
            });
            return () => { data.subscription.unsubscribe(); timers.forEach(clearTimeout); timers.clear(); };
        },
    };
}
