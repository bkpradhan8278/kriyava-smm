import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("instagram-followers");

export default function Page() {
  return <ServiceView slug="instagram-followers" />;
}
