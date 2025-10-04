import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";

import { AgencyDetails } from "@/components/agencies/agency-details";

import AgencyUsers from "@/components/agencies/agency-users";
import AgencyServices from "@/components/agencies/agency-services";
import { useState } from "react";
import { useAgencies } from "@/hooks/use-agencies";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agency } from "@/data/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export const AgenciesPage = () => {
   const navigate = useNavigate();

   const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
   const { data: agencies = [], isLoading, error } = useAgencies.get();
   // Derive the actual selected agency object
   const selectedAgency = agencies.find((agency: Agency) => agency.id === selectedAgencyId) ?? agencies[0] ?? null;

   if (isLoading) return <Skeleton className="h-[200px] w-full" />;
   if (error) return <div>Error loading agencies</div>;

   return (
      <div className="flex  flex-col gap-4">
         <div>
            <div className="flex flex-col mb-4">
               <h3 className=" font-bold">Agencias</h3>
               <p className="text-sm text-gray-500 "> Listado de Agencias</p>
            </div>
            {agencies?.length > 0 && (
               <div className="flex justify-between md:justify-start items-center gap-2">
                  <AgenciesCombobox
                     isLoading={isLoading}
                     agencies={agencies}
                     selectedAgency={selectedAgency}
                     setSelectedAgency={(agency) => setSelectedAgencyId(agency?.id ?? null)}
                  />

                  <Button
                     className="w-auto md:w-auto"
                     variant="outline"
                     onClick={() => {
                        navigate("/settings/agencies/new");
                     }}
                  >
                     <PlusCircle size={16} /> <span className="hidden md:block">Nueva Agencia</span>
                  </Button>
               </div>
            )}
         </div>
         {!selectedAgency ? (
            <div className="text-center">No hay agencia seleccionada</div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5  space-y-4 md:space-x-4">
               <div className="col-span-2 space-y-4">
                  <AgencyDetails selectedAgency={selectedAgency} />
                  <AgencyUsers agency_id={selectedAgency.id ?? 0} />
               </div>
               <div className="col-span-3">
                  <AgencyServices agencyId={selectedAgency.id ?? 0} />
               </div>
            </div>
         )}
      </div>
   );
};
