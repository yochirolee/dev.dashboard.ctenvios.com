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
import { ButtonGroup } from "@/components/ui/button-group";

export const AgenciesPage = () => {
   const navigate = useNavigate();

   const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
   const { data: agencies = [], isLoading, error } = useAgencies.get();

   const selectedAgency = agencies.find((agency: Agency) => agency.id === selectedAgencyId) ?? agencies[0] ?? null;

   if (isLoading)
      return (
         <div className="space-y-4 container max-w-screen-xl mx-auto">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      )
   if (error) return <div className="space-y-4 container max-w-screen-xl mx-auto">Error loading agencies</div>;

   return (
      <div className="flex flex-col container max-w-screen-xl mx-auto gap-4 items-center">
         <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
               <h3 className=" font-bold">Agencias</h3>
               <p className="text-sm text-gray-500 "> Listado de Agencias</p>
            </div>
            {agencies?.length > 0 && (
               <ButtonGroup orientation="horizontal" className="w-full">
                  <AgenciesCombobox
                     isLoading={isLoading}
                     agencies={agencies}
                     selectedAgency={selectedAgency}
                     setSelectedAgency={(agency) => setSelectedAgencyId(agency?.id ?? null)}
                  />

                  <Button
                     variant="outline"
                     onClick={() => {
                        navigate("/settings/agencies/new");
                     }}
                  >
                     <PlusCircle size={16} /> <span className="hidden md:block">Nueva Agencia</span>
                  </Button>
               </ButtonGroup>
            )}
         </div>

         {!selectedAgency ? (
            <div className="text-center">No hay agencia seleccionada</div>
         ) : (
            <div className="space-y-4 w-full">
               <AgencyDetails selectedAgency={selectedAgency} />
               <AgencyUsers agency_id={selectedAgency.id ?? 0} />
               <AgencyServices agencyId={selectedAgency.id ?? 0} />
            </div>
         )}
      </div>
   );
};
