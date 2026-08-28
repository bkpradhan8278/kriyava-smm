import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("spotify-plays");

export default function Page() {
  return <ServiceView slug="spotify-plays" />;
}
