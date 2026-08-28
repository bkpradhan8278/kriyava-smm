import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("instagram-views");

export default function Page() {
  return <ServiceView slug="instagram-views" />;
}
