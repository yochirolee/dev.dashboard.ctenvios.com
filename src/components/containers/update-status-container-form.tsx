import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContainers } from "@/hooks/use-containers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { containerStatus, type ContainerStatus } from "@/data/types";

const statusLabels: Record<ContainerStatus, string> = {
   PENDING: "Pendiente",
   LOADING: "Cargando",
   SEALED: "Sellado",
   DEPARTED: "En Camino",
   IN_TRANSIT: "En Tránsito",
   AT_PORT: "En Puerto",
   CUSTOMS_HOLD: "Retenido en Aduana",
   CUSTOMS_CLEARED: "Liberado de Aduana",
   UNLOADING: "Descargando",
   COMPLETED: "Completado",
};

const updateStatusSchema = z.object({
   status: z.string().min(1, { message: "El estado es requerido" }),
   location: z.string().optional(),
   description: z.string().optional(),
});

type UpdateStatusSchema = z.infer<typeof updateStatusSchema>;

interface UpdateStatusContainerFormProps {
   containerId: number;
   currentStatus: ContainerStatus;
   setOpen: (open: boolean) => void;
}

export const UpdateStatusContainerForm = ({ containerId, currentStatus, setOpen }: UpdateStatusContainerFormProps) => {
   const form = useForm<UpdateStatusSchema>({
      resolver: zodResolver(updateStatusSchema),
      defaultValues: {
         status: currentStatus,
         location: "",
         description: "",
      },
   });

   const updateStatusMutation = useContainers.updateStatus();

   const onSubmit = (data: UpdateStatusSchema) => {
      updateStatusMutation.mutate(
         {
            id: containerId,
            data: {
               status: data.status,
               location: data.location || undefined,
               description: data.description || undefined,
            },
         },
         {
            onSuccess: () => {
               form.reset();
               toast.success("Estado del contenedor actualizado");
               setOpen(false);
            },
            onError: (error: any) => {
               toast.error(error.response?.data?.message || "Error al actualizar el estado");
            },
         }
      );
   };

   const statusOptions = Object.entries(containerStatus).map(([key, value]) => ({
      value: value,
      label: statusLabels[value as ContainerStatus] || key,
   }));

   return (
      <form id="form-update-container-status" onSubmit={form.handleSubmit(onSubmit)}>
         <FieldGroup className="p-4">
            <Controller
               control={form.control}
               name="status"
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel>Estado</FieldLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                           <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                           {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                 {option.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />

            <Controller
               control={form.control}
               name="location"
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel>Ubicación (opcional)</FieldLabel>
                     <Input {...field} placeholder="Ej: Puerto de Miami, Aduana Mariel..." />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />

            <Controller
               control={form.control}
               name="description"
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel>Descripción (opcional)</FieldLabel>
                     <Textarea {...field} placeholder="Notas adicionales sobre el cambio de estado..." rows={3} />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />
         </FieldGroup>

         <FieldSeparator className="my-2" />
         <Field className="px-4 pb-4">
            <Button
               type="submit"
               form="form-update-container-status"
               disabled={updateStatusMutation.isPending}
               className="w-full"
            >
               {updateStatusMutation.isPending ? (
                  <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Actualizando...
                  </>
               ) : (
                  "Actualizar Estado"
               )}
            </Button>
         </Field>
      </form>
   );
};
