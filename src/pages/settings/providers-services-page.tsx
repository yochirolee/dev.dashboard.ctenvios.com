import { NewProviderForm } from "@/components/providers/new-provider-form";
import { ProvidersCombobox } from "@/components/providers/providers-combobox";
import { ProviderDetails } from "@/components/providers/provider-details";
import { ShareDialog } from "@/components/shares/share-dialog";
import { useState } from "react";
import { ButtonGroup } from "@/components/ui/button-group";

export default function ProvidersServicesPage() {
   const [selectedProviderId, setSelectedProviderId] = useState<number>(1);
   const [open, setOpen] = useState(false);

   return (
      <div className="flex flex-col container max-w-screen-xl mx-auto gap-4 items-center">
         <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
               <h3 className=" font-bold">Proveedores</h3>
               <p className="text-sm text-gray-500 "> Listado de Proveedores</p>
            </div>
            <ButtonGroup orientation="horizontal" className="w-full">
               <ProvidersCombobox selectedProvider={selectedProviderId} setSelectedProvider={setSelectedProviderId} />
               <ShareDialog
                  open={open}
                  setOpen={setOpen}
                  children={<NewProviderForm setOpen={setOpen} />}
                  title="Crear Proveedor"
                  description="Crea un nuevo proveedor para tus servicios"
                  mode="create"
               />
            </ButtonGroup>
         </div>
         <ProviderDetails providerId={selectedProviderId} />
      </div>
   );
}
