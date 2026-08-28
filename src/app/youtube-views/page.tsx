import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("youtube-views");

export default function Page() {
  return <ServiceView slug="youtube-views" />;
}
