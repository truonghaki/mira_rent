import { PersistenceQueue } from "@/services/persistence";
import { useCallback, useRef } from "react";
import type { ShopState } from "@/types/shop";
import { deleteProduct, saveProduct } from "@/features/products/operations";
import { cancelReservation, completeRental, reserveProduct, startRental, } from "@/features/rentals/operations";
import type { DemoServices } from "@/services/contracts";
import { demoServices } from "@/services/demo";
import { createDemoState } from "@/services/demo/fixtures";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ShopContext, type ShopContextValue } from "./ShopContext";
export default function DemoShopProvider({ children, services = demoServices, }: {
    children: ReactNode;
    services?: DemoServices;
}) {
    const [state, setState] = useState(services.initialState);
    const [authenticated, setAuthenticated] = useState(services.initialSession);
    const [loaded, setLoaded] = useState(false);
    const [serviceError, setServiceError] = useState<Error | null>(null);
    const revision = useRef(0);
    const authRevision = useRef(0);
    const persistence = useMemo(() => new PersistenceQueue(services.repository), [services.repository]);
    const reportError = useCallback((error: unknown) => setServiceError(error instanceof Error ? error : new Error(String(error))), []);
    const mutate = useCallback((operation: (current: ShopState) => ShopState) => {
        revision.current++;
        setState(operation);
    }, []);
    useEffect(() => {
        let cancelled = false;
        const initialRevision = revision.current;
        const initialAuthRevision = authRevision.current;
        setLoaded(false);
        void services.repository
            .load()
            .then((snapshot) => {
            if (cancelled)
                return;
            if (revision.current === initialRevision)
                setState(snapshot);
            setLoaded(true);
        })
            .catch((error: unknown) => {
            if (!cancelled)
                reportError(error);
        });
        void services.auth
            .hasSession()
            .then((session) => {
            if (!cancelled && authRevision.current === initialAuthRevision)
                setAuthenticated(session);
        })
            .catch((error: unknown) => {
            if (!cancelled)
                reportError(error);
        });
        return () => {
            cancelled = true;
        };
    }, [services, reportError]);
    useEffect(() => {
        if (!loaded)
            return;
        let cancelled = false;
        void persistence
            .save(state)
            .then(() => {
            if (!cancelled)
                setServiceError(null);
        })
            .catch((error: unknown) => {
            if (!cancelled)
                reportError(error);
        });
        return () => {
            cancelled = true;
        };
    }, [state, loaded, persistence, reportError]);
    const value = useMemo<ShopContextValue>(() => ({
        ...state,
        authLoading: false, busy: false, databaseProductId: (id) => id,
        authenticated,
        services,
        serviceError,
        saveProduct: async (product) => mutate((current) => saveProduct(current, product)),
        deleteProduct: async (id) => mutate((current) => deleteProduct(current, id)),
        reserveProduct: async (productId, draft, startImmediately = false) => {
            const context = {
                timestamp: new Date().toISOString(),
                orderId: `MIRA-${Date.now().toString().slice(-8)}-${crypto.randomUUID().slice(0, 8)}`,
            };
            mutate((current) => reserveProduct(current, productId, draft, startImmediately, context));
        },
        startRental: async (orderId, draft) => {
            const timestamp = new Date().toISOString();
            mutate((current) => startRental(current, orderId, timestamp, draft));
        },
        cancelReservation: async (orderId) => {
            const timestamp = new Date().toISOString();
            mutate((current) => cancelReservation(current, orderId, timestamp));
        },
        completeRental: async (orderId, draft) => {
            const timestamp = new Date().toISOString();
            mutate((current) => completeRental(current, orderId, draft, timestamp));
        },
        saveSettings: async (settings) => mutate((current) => ({ ...current, settings })),
        login: async (email, password) => {
            authRevision.current++;
            await services.auth.signIn(email, password);
            setAuthenticated(true);
        },
        logout: async () => {
            authRevision.current++;
            await services.auth.signOut();
            setAuthenticated(false);
        },
        resetDemo: async () => {
            revision.current++;
            try {
                await persistence.reset();
                setState(createDemoState());
            }
            catch (error) {
                reportError(error);
                throw error;
            }
        },
    }), [
        state,
        authenticated,
        services,
        serviceError,
        mutate,
        persistence,
        reportError,
    ]);
    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
