import type { CompletionDraft, RentalDraft } from "@/features/rentals/drafts";
import type { AppServices } from "@/services/contracts";
import type { Product } from "@/types/product";
import type { ShopSettings } from "@/types/settings";
import type { ShopState } from "@/types/shop";
import { createContext } from "react";
export interface ShopContextValue extends ShopState {
    authenticated: boolean;
    authLoading: boolean;
    busy: boolean;
    databaseProductId: (id: string) => string;
    services: AppServices;
    serviceError: Error | null;
    saveProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    reserveProduct: (productId: string, draft: RentalDraft, startImmediately?: boolean, requestId?: string) => Promise<void>;
    startRental: (orderId: string, draft?: Partial<RentalDraft>) => Promise<void>;
    cancelReservation: (orderId: string) => Promise<void>;
    completeRental: (orderId: string, draft: CompletionDraft) => Promise<void>;
    saveSettings: (settings: ShopSettings) => Promise<void>;
    login: (email?: string, password?: string) => Promise<void>;
    logout: () => Promise<void>;
    resetDemo: () => Promise<void>;
}
export const ShopContext = createContext<ShopContextValue | null>(null);
