import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("youtube-subscribers");

export default function Page() {
  return <ServiceView slug="youtube-subscribers" />;
}
