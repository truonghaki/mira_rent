import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { BackendSnapshot, SupabaseServices } from "@/services/contracts";
import { BackendError, backendError } from "@/services/supabase/errors";
import { ShopContext, type ShopContextValue } from "./ShopContext";
export default function SupabaseShopProvider({ children, services }: {
    children: ReactNode;
    services: SupabaseServices;
}) {
    const [state, setState] = useState(services.initialState);
    const [authenticated, setAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [serviceError, setServiceError] = useState<Error | null>(null);
    const snapshot = useRef<BackendSnapshot | null>(null);
    const epoch = useRef(0), running = useRef(false);
    const adopt = useCallback((next: BackendSnapshot) => { snapshot.current = next; setState(next.state); }, []);
    const clearPrivate = useCallback(() => {
        snapshot.current = null;
        setAuthenticated(false);
        setState(current => ({ ...current, orders: [] }));
    }, []);
    const synchronize = useCallback(async () => {
        const token = ++epoch.current;
        clearPrivate();
        setAuthLoading(true);
        try {
            const access = await services.auth.getAccess();
            const data = await services.reads.load(access.isAdmin);
            if (token !== epoch.current)
                return;
            adopt(data);
            setAuthenticated(access.isAdmin);
            setServiceError(null);
        }
        catch (error) {
            if (token === epoch.current)
                setServiceError(backendError(error));
        }
        finally {
            if (token === epoch.current)
                setAuthLoading(false);
        }
    }, [services, clearPrivate, adopt]);
    useEffect(() => {
        void synchronize();
        const unsubscribe = services.auth.subscribe(() => { void synchronize(); });
        return () => { epoch.current++; unsubscribe(); };
    }, [services, synchronize]);
    const run = useCallback(async (command: () => Promise<void>) => {
        if (!authenticated || authLoading)
            throw new BackendError("ADMIN_REQUIRED", "Vui lòng đăng nhập bằng tài khoản quản trị.");
        if (running.current)
            throw new BackendError("PENDING", "Thao tác đang được xử lý. Vui lòng chờ.");
        running.current = true;
        setBusy(true);
        setServiceError(null);
        const token = epoch.current;
        let committed = false;
        try {
            await command();
            committed = true;
            const access = await services.auth.getAccess();
            if (token !== epoch.current)
                throw new BackendError("AUTH_CHANGED", "Phiên đăng nhập đã thay đổi. Vui lòng kiểm tra lại.");
            if (!access.isAdmin) {
                clearPrivate();
                throw new BackendError("ADMIN_REQUIRED", "Quyền quản trị đã thay đổi. Vui lòng đăng nhập lại.");
            }
            const next = await services.reads.load(true);
            if (token !== epoch.current)
                throw new BackendError("AUTH_CHANGED", "Phiên đăng nhập đã thay đổi. Vui lòng kiểm tra lại.");
            adopt(next);
        }
        catch (error) {
            let failure = backendError(error);
            if (token === epoch.current) {
                if (failure.code === "ADMIN_REQUIRED")
                    clearPrivate();
                else if (!committed) {
                    try {
                        const next = await services.reads.load(true);
                        if (token === epoch.current)
                            adopt(next);
                    }
                    catch { /* retain form, report original failure */ }
                }
                if (committed && failure.code !== "ADMIN_REQUIRED" && failure.code !== "AUTH_CHANGED")
                    failure = new BackendError("RELOAD_REQUIRED", "Thao tác đã được lưu nhưng chưa tải lại dữ liệu. Vui lòng kiểm tra lại trước khi tiếp tục.", true);
                setServiceError(failure);
            }
            throw failure;
        }
        finally {
            running.current = false;
            setBusy(false);
        }
    }, [authenticated, authLoading, services, clearPrivate, adopt]);
    const productVersion = (id: string) => {
        const version = snapshot.current?.productVersions[id];
        if (version === undefined)
            throw new BackendError("NOT_FOUND", "Chưa tải được phiên bản sản phẩm. Vui lòng tải lại.");
        return version;
    };
    const orderVersion = (id: string) => {
        const version = snapshot.current?.orderVersions[id];
        if (version === undefined)
            throw new BackendError("NOT_FOUND", "Chưa tải được phiên bản đơn thuê. Vui lòng tải lại.");
        return version;
    };
    const value: ShopContextValue = {
        ...state, services, authenticated, authLoading, busy, serviceError,
        databaseProductId: (id) => snapshot.current?.productDatabaseIds[id] || id,
        saveProduct: (product) => run(() => services.commands.saveProduct(product, snapshot.current?.productVersions[product.id] ?? null)),
        deleteProduct: (id) => run(() => services.commands.archiveProduct(id, productVersion(id))),
        reserveProduct: (id, draft, direct = false, requestId = crypto.randomUUID()) => run(() => services.commands.createRental(id, draft, direct, requestId)),
        startRental: (code, draft) => run(() => services.commands.startRental(code, orderVersion(code), draft)),
        cancelReservation: (code) => run(() => services.commands.cancelReservation(code, orderVersion(code))),
        completeRental: (code, draft) => run(() => services.commands.completeRental(code, orderVersion(code), draft)),
        saveSettings: (settings) => run(() => {
            const version = snapshot.current?.settingsVersion;
            if (version === undefined)
                throw new BackendError("NOT_FOUND", "Chưa tải được cấu hình cửa hàng.");
            return services.commands.saveSettings(settings, version);
        }),
        login: async (email, password) => { await services.auth.signIn(email, password); await synchronize(); },
        logout: async () => {
            epoch.current++;
            clearPrivate();
            setAuthLoading(false);
            try {
                await services.auth.signOut();
                await synchronize();
            }
            catch (error) {
                setServiceError(backendError(error));
                throw backendError(error);
            }
        },
        resetDemo: async () => { throw new BackendError("DEMO_ONLY", "Khôi phục dữ liệu demo không áp dụng cho cửa hàng đang kết nối."); },
    };
    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
