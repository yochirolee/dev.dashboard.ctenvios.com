import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useProviders } from "@/hooks/use-providers";
import type { Provider } from "@/data/types";
import { Pencil } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import ServicesList from "./services-list";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
               <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
                  <div className="flex items-center gap-4">
                     <div className=" bg-muted min-h-24 min-w-24 object-cover rounded-full"></div>
						   <div className="flex flex-col gap-2">
							   <div className="flex items-center gap-2">
								   <h1 className="text-2xl font-bold">{provider?.name}</h1>
								   <Tooltip>
								   		<TooltipTrigger asChild>
								   <Button variant="ghost" size="icon">
									   <Pencil />
								   </Button>
								   </TooltipTrigger>
								   <TooltipContent>
								   		<span>Editar</span>
								   </TooltipContent>
								   </Tooltip>
								   </div>
                        <p className="text-sm text-muted-foreground">{provider?.address}</p>
                     </div>
                  </div>
                  <div className="flex items-center  gap-4">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-4 text-muted-foreground text-sm">
                        <span>Contacto: {provider?.contact}</span>
                        <span>Teléfono: {provider?.phone}</span>
                        <span>Email: {provider?.email}</span>
                        <span>Website: {provider?.website}</span>
                     </div>
                     
                       
                    
                  </div>
               </div>
            </CardContent>
         </Card>

         <ServicesList provider={provider as Provider} services={provider?.services as unknown as []} />
      </div>
   )
};
