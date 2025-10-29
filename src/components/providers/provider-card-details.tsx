import type { Provider } from "@/data/types";
import { Card, CardContent } from "../ui/card";
import ImageUploadForm from "../upload/ImageUploadForm";
import { Separator } from "../ui/separator";
import { User, Phone, Mail, Globe } from "lucide-react";

export const ProviderCardDetails = ({ provider }: { provider: Provider }) => {
   return (
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
   );
};
