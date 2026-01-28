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
import { Key, PlusCircle } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";

export const AgenciesPage = () => {
   const navigate = useNavigate();

   const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
   const { data: agencies = [], isLoading, error } = useAgencies.get();
   const selectedAgency = agencies.find((agency: Agency) => agency.id === selectedAgencyId) ?? agencies[0] ?? null;

   if (isLoading)
      return (
         <div className="space-y-4 container max-w-screen-xl mx-auto p-2 md:p-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      );
   if (error) return <div className="space-y-4 container max-w-screen-xl mx-auto">Error loading agencies</div>;

   return (
      <div className="flex flex-col container max-w-screen-xl mx-auto gap-4 items-center p-2 md:p-4">
         <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
               <h3 className=" font-bold">Agencias</h3>
               <p className="text-sm text-gray-500 "> Listado de Agencias</p>
            </div>
            {agencies?.length > 0 && (
               <div className="flex flex-row gap-2 w-full">
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
                        <PlusCircle size={16} /> <span className="hidden md:block">Crear Agencia</span>
                     </Button>
                  </ButtonGroup>
                  <Button
                     variant="outline"
                     onClick={() => {
                        if (!selectedAgency) return;
                        navigate(`/settings/agencies/integrations?agencyId=${selectedAgency.id}`);
                     }}
                  >
                     <Key size={16} /> <span className="hidden md:block">Integraciones</span>
                  </Button>
               </div>
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
