import { NewProviderForm } from "@/components/providers/new-provider-form";
import { ProvidersCombobox } from "@/components/providers/providers-combobox";
import { ProviderDetails } from "@/components/providers/provider-details";
import { ShareDialog } from "@/components/shares/share-dialog";
import { useState } from "react";

export default function ProvidersServicesPage() {
   const [selectedProviderId, setSelectedProviderId] = useState<number>(1);
   const [open, setOpen] = useState(false);

   console.log(selectedProviderId);
   return (
      <>
         <div className="flex  gap-2 items-center">
            <ProvidersCombobox selectedProvider={selectedProviderId} setSelectedProvider={setSelectedProviderId} />
            <ShareDialog
               open={open}
               setOpen={setOpen}
               children={<NewProviderForm setOpen={setOpen} />}
               title="Crear Proveedor"
               description="Crea un nuevo proveedor para tus servicios"
               mode="create"
            />
         </div>
         <ProviderDetails providerId={selectedProviderId} />
      </>
   );
}
