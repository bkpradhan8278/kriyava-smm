import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("twitter-followers");

export default function Page() {
  return <ServiceView slug="twitter-followers" />;
}
