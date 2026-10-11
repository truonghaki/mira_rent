import type { AppServices } from "@/services/contracts"
import ServiceFeedback from "@/components/common/ServiceFeedback"
import type { ReactNode } from "react"
import ShopProvider from "./ShopProvider"
export default function AppProviders({
  children,
  services,
}: {
  children: ReactNode
  services?: AppServices
}) {
  return (
    <ShopProvider services={services}>
      {children}
      <ServiceFeedback />
    </ShopProvider>
  )
}
