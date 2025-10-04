import { Card, CardContent } from "../ui/card";
import { useProviders } from "@/hooks/use-providers";
import type { Provider } from "@/data/types";
import {  Globe, Mail, Phone, User } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import ServicesList from "./services-list";
import ImageUploadForm from "../upload/ImageUploadForm";
import { Separator } from "../ui/separator";

export const ProviderDetails = ({ providerId }: { providerId: number }) => {
   const { data: provider, isPending } = useProviders.getById(providerId ?? 0);
   if (isPending)
      return (
         <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      );
   return (
      <div className="space-y-4">
         <Card>
            <CardContent>
               <div className="flex flex-row items-center gap-4">
                  {provider?.logo ? (
                     <img
                        src={provider?.logo}
                        alt={provider?.name}
                        className="w-20 h-20  object-center object-scale-down rounded-full border  "
                     />
                  ) : (
                     <ImageUploadForm onChange={() => {}} label="Seleccionar imagen" defaultImage={provider?.logo} />
                  )}

                  <div className="flex flex-col gap-2 w-full">
                     <h1 className="text-2xl font-bold">{provider?.name}</h1>

                     <p className="text-sm text-muted-foreground">{provider?.address}</p>
                  </div>
               </div>
               <Separator className="my-4" />
               <div className="grid grid-cols-2 gap-3 my-4 text-sm">
                  <span className="flex items-center gap-2">
                     {provider?.contact && <User size={16} className="text-muted-foreground" />} {provider?.contact}
                  </span>
                  <span className="flex items-center gap-2">
                     {provider?.phone && <Phone size={16} className="text-muted-foreground" />} {provider?.phone}
                  </span>
                  <span className="flex items-center gap-2">
                     {provider?.email && <Mail size={16} className="text-muted-foreground" />} {provider?.email}
                  </span>
                  <span className="flex items-center gap-2">
                     {provider?.website && <Globe size={16} className="text-muted-foreground" />} {provider?.website}
                  </span>
               </div>
            </CardContent>
         </Card>

         <ServicesList provider={provider as Provider} services={provider?.services as unknown as []} />
      </div>
   );
};
