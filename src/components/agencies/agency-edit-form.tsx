import { type Agency } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAgencies } from "@/hooks/use-agencies";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// Schema for edit form - allows empty strings for optional URL fields
const agencyEditSchema = z.object({
   id: z.number().optional(),
   name: z.string().min(1, "El nombre es requerido"),
   address: z.string().min(1, "La dirección es requerida"),
   phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
   contact: z.string(),
   email: z.email().optional().or(z.literal("")),
   website: z.string().url().optional().or(z.literal("")),
   agency_type: z.enum(["FORWARDER", "AGENCY", "RESELLER"]).optional(),
   parent_agency_id: z.number().optional().nullable(),
});

interface AgencyEditFormProps {
   agency: Agency;
   onSuccess: () => void;
}

export const AgencyEditForm = ({ agency, onSuccess }: AgencyEditFormProps): React.ReactElement => {
   const { mutate: updateAgency, isPending } = useAgencies.update({
      onSuccess: () => {
         toast.success("Agencia actualizada correctamente");
         queryClient.invalidateQueries({ queryKey: ["get-agency", agency.id] });
         onSuccess();
      },
      onError: () => {
         toast.error("Error al actualizar la agencia");
      },
   });

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<Agency>({
      resolver: zodResolver(agencyEditSchema),
      defaultValues: {
         id: agency.id,
         name: agency.name,
         address: agency.address,
         phone: agency.phone,
         contact: agency.contact,
         email: agency.email || "",
         website: agency.website || "",
         agency_type: agency.agency_type,
         parent_agency_id: agency.parent_agency_id,
      },
   });

   const onSubmit = (data: Agency): void => {
      // Clean up empty optional fields
      const cleanedData = {
         ...data,
         website: data.website || undefined,
         email: data.email || undefined,
      };
      updateAgency({ id: agency.id as number, data: cleanedData });
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="name">Nombre</Label>
               <Input id="name" {...register("name")} />
               {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
               <Label htmlFor="contact">Contacto</Label>
               <Input id="contact" {...register("contact")} />
               {errors.contact && <p className="text-xs text-destructive">{errors.contact.message}</p>}
            </div>
         </div>

         <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="phone">Teléfono</Label>
               <Input id="phone" {...register("phone")} />
               {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input id="email" type="email" {...register("email")} />
               {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="website">Sitio Web</Label>
               <Input id="website" {...register("website")} placeholder="https://" />
               {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>
         </div>

         <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
               {isPending ? (
                  <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Guardando...
                  </>
               ) : (
                  "Guardar cambios"
               )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onSuccess()}>
               Cancelar
            </Button>
         
         </div>
      </form>
   );
};
