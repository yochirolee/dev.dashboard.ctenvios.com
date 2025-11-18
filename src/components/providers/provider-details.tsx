import { useProviders } from "@/hooks/use-providers";
import type {Provider } from "@/data/types";
import { Skeleton } from "../ui/skeleton";
import ServicesList from "./services/services-list";
import { ProviderCardDetails } from "./provider-card-details";

export const ProviderDetails = ({ providerId }: { providerId: number }) => {
   const { data: provider, isPending } = useProviders.getById(providerId ?? 0);
   if (isPending)
      return (
         <div className="space-y-4 container max-w-screen-xl mx-auto">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      );
   return (
      <div className="space-y-4 container max-w-screen-xl mx-auto">
         <ProviderCardDetails provider={provider as Provider} />
         <ServicesList provider={provider as Provider} services={provider?.services as unknown as []} />
       
      </div>
   );
};
