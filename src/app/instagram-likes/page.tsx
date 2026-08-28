import { ServiceView, serviceMetadata } from "@/components/marketing/ServiceView";

export const metadata = serviceMetadata("instagram-likes");

export default function Page() {
  return <ServiceView slug="instagram-likes" />;
}
