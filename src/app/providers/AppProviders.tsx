import { getAppServices } from "@/services";
import { userMessage } from "@/services/supabase/errors";
import Empty from "@/components/ui/Empty";
import type { AppServices } from "@/services/contracts";
import ServiceFeedback from "@/components/common/ServiceFeedback";
import type { ReactNode } from "react";
import ShopProvider from "./ShopProvider";
export default function AppProviders({ children, services, }: {
    children: ReactNode;
    services?: AppServices;
}) {
    let selected: AppServices;
    try {
        selected = services || getAppServices();
    }
    catch (error) {
        return <main className="page"><Empty title="Chưa kết nối được cửa hàng" copy={userMessage(error)}/></main>;
    }
    return (<ShopProvider services={selected}>
      {children}
      <ServiceFeedback />
    </ShopProvider>);
}
