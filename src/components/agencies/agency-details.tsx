import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import type { Agency } from "@/data/types";
import { Badge } from "../ui/badge";
import { Edit, Phone, User } from "lucide-react";
import { Mail } from "lucide-react";
import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { AgencyEditForm } from "./agency-edit-form";
import { AgencyLogoUpload } from "./agency-logo-upload";

export const AgencyDetails = ({ selectedAgency }: { selectedAgency: Agency }) => {
	const [isOpen, setIsOpen] = useState(false);
	
	
   if (!selectedAgency) return <Skeleton className="h-[200px] w-full" />;
   return (
      <Card>
         <CardContent>
            <div className="flex flex-row items-center justify-between">
               <div className="flex flex-row items-center gap-4">
                  <AgencyLogoUpload
                     agencyId={selectedAgency.id as number}
                     agencyName={selectedAgency.name}
                     currentLogo={selectedAgency.logo}
                  />

                  <div className="flex flex-col gap-2 w-full">
                     <h1 className="lg:text-2xl font-bold">{selectedAgency?.name}</h1>
                     <Badge variant="outline">{selectedAgency?.agency_type?.toUpperCase()}</Badge>

                     <p className="text-sm text-muted-foreground">{selectedAgency?.address}</p>
                  </div>
               </div>
               <div>
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                     <DialogTrigger asChild>
                        <Button variant="outline">
                           <Edit size={16} />
                           <span className="hidden md:block">Editar</span>
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl">
                        <DialogHeader>
                           <DialogTitle>Editar Agencia</DialogTitle>
                           <DialogDescription>Actualiza la información de la agencia</DialogDescription>
                        </DialogHeader>
                        <AgencyEditForm agency={selectedAgency} onSuccess={() => setIsOpen(false)} />
                     </DialogContent>
                  </Dialog>
               </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 my-4 text-sm">
               {selectedAgency?.contact && (
                  <span className="flex items-center gap-2">
                     <User size={16} className="text-muted-foreground" /> {selectedAgency?.contact}
                  </span>
               )}
               {selectedAgency?.phone && (
                  <span className="flex items-center gap-2">
                     <Phone size={16} className="text-muted-foreground" /> {selectedAgency?.phone}
                  </span>
               )}
               {selectedAgency?.email && (
                  <span className="flex items-center gap-2">
                     <Mail size={16} className="text-muted-foreground" /> {selectedAgency?.email}
                  </span>
               )}
               {selectedAgency?.website && (
                  <span className="flex items-center gap-2">
                     <Globe size={16} className="text-muted-foreground" /> {selectedAgency?.website}
                  </span>
               )}
            </div>
         </CardContent>
      </Card>
   );
};
