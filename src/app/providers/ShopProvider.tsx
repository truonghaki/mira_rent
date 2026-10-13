import type { ReactNode } from "react";
import type { AppServices } from "@/services/contracts";
import { demoServices } from "@/services/demo";
import DemoShopProvider from "./DemoShopProvider";
import SupabaseShopProvider from "./SupabaseShopProvider";
export default function ShopProvider({ children, services = demoServices }: {
    children: ReactNode;
    services?: AppServices;
}) {
    return services.mode === "supabase" ? <SupabaseShopProvider services={services}>{children}</SupabaseShopProvider> : <DemoShopProvider services={services}>{children}</DemoShopProvider>;
}
