import type { ProductImage } from "@/types/product";
import type { ShopState } from "@/types/shop";
import type { Product } from "@/types/product";
import type { ShopSettings } from "@/types/settings";
import type { CompletionDraft, RentalDraft } from "@/features/rentals/drafts";
/** A write is a complete transaction: an order and availability cannot diverge. */
export interface DataRepository {
    load(): Promise<ShopState>;
    save(state: ShopState): Promise<void>;
    reset(): Promise<void>;
}
export interface AuthAdapter {
    signIn(email?: string, password?: string): Promise<void>;
    signOut(): Promise<void>;
    hasSession(): Promise<boolean>;
}
export interface ImageStorageAdapter {
    upload(files: File[], context?: {
        productId: string;
    }): Promise<ProductImage[]>;
    remove(id: string): Promise<void>;
    release(url: string): void;
}
export interface DemoServices {
    mode: "demo";
    repository: DataRepository;
    auth: AuthAdapter;
    imageStorage: ImageStorageAdapter;
    initialState: () => ShopState;
    initialSession: () => boolean;
}
export interface AdminAccess {
    signedIn: boolean;
    isAdmin: boolean;
    userId: string | null;
    role: "owner" | "admin" | null;
}
export interface BackendSnapshot {
    state: ShopState;
    productVersions: Record<string, number>;
    productDatabaseIds: Record<string, string>;
    orderVersions: Record<string, number>;
    settingsVersion: number;
}
export interface BackendCommands {
    saveProduct(product: Product, expectedVersion: number | null): Promise<void>;
    archiveProduct(id: string, expectedVersion: number): Promise<void>;
    createRental(id: string, draft: RentalDraft, direct: boolean, requestId: string): Promise<void>;
    startRental(code: string, version: number, draft?: Partial<RentalDraft>): Promise<void>;
    cancelReservation(code: string, version: number): Promise<void>;
    completeRental(code: string, version: number, draft: CompletionDraft): Promise<void>;
    saveSettings(settings: ShopSettings, version: number): Promise<void>;
}
export interface SupabaseServices {
    mode: "supabase";
    auth: AuthAdapter & {
        getAccess(): Promise<AdminAccess>;
        subscribe(listener: () => void): () => void;
    };
    reads: {
        load(admin: boolean): Promise<BackendSnapshot>;
    };
    commands: BackendCommands;
    imageStorage: ImageStorageAdapter;
    initialState: () => ShopState;
    initialSession: () => boolean;
}
export type AppServices = DemoServices | SupabaseServices;
