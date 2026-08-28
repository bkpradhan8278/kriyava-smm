import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("website-traffic");

export default function Page() {
  return <ServiceView slug="website-traffic" />;
}
