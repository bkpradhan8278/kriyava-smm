import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("telegram-members");

export default function Page() {
  return <ServiceView slug="telegram-members" />;
}
