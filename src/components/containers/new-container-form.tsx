import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContainers } from "@/hooks/use-containers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProvidersCombobox } from "@/components/providers/providers-combobox";
import { containerType } from "@/data/types";

const containerTypeOptions = [
   { value: containerType.DRY_20FT, label: "Dry 20ft" },
   { value: containerType.DRY_40FT, label: "Dry 40ft" },
   { value: containerType.DRY_40FT_HC, label: "Dry 40ft HC" },
   { value: containerType.REEFER_20FT, label: "Reefer 20ft" },
   { value: containerType.REEFER_40FT, label: "Reefer 40ft" },
   { value: containerType.REEFER_40FT_HC, label: "Reefer 40ft HC" },
];

const newContainerSchema = z.object({
   container_name: z.string().min(1, { message: "El nombre del contenedor es requerido" }),
   container_number: z.string().min(1, { message: "El número del contenedor es requerido" }),
   container_type: z.string().min(1, { message: "El tipo de contenedor es requerido" }),
   origin_port: z.string().min(1, { message: "El puerto de origen es requerido" }),
   destination_port: z.string().min(1, { message: "El puerto de destino es requerido" }),
   provider_id: z.number().min(1, { message: "El proveedor es requerido" }),
});

type NewContainerSchema = z.infer<typeof newContainerSchema>;

interface NewContainerFormProps {
   setOpen: (open: boolean) => void;
}

export const NewContainerForm = ({ setOpen }: NewContainerFormProps) => {
   const form = useForm<NewContainerSchema>({
      resolver: zodResolver(newContainerSchema),
      defaultValues: {
         container_name: "",
         container_number: "",
         container_type: containerType.DRY_40FT,
         origin_port: "",
         destination_port: "",
         provider_id: 0,
      },
   });

   const createContainerMutation = useContainers.create();

   const onSubmit = (data: NewContainerSchema) => {
      createContainerMutation.mutate(data, {
         onSuccess: () => {
            form.reset();
            toast.success("Contenedor creado correctamente");
            setOpen(false);
         },
         onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al crear el contenedor");
         },
      });
   };

   return (
      <form id="form-create-container" onSubmit={form.handleSubmit(onSubmit)}>
         <ScrollArea className="h-[calc(100vh-100px)] lg:h-auto p-4">
            <FieldGroup>
               <Controller
                  control={form.control}
                  name="container_name"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nombre del Contenedor</FieldLabel>
                        <Input {...field} placeholder="CONT-2601" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="container_number"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Número del Contenedor</FieldLabel>
                        <Input {...field} placeholder="SEGU20244" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="container_type"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Tipo de Contenedor</FieldLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                           </SelectTrigger>
                           <SelectContent>
                              {containerTypeOptions.map((option) => (
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
                  name="origin_port"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Puerto de Origen</FieldLabel>
                        <Input {...field} placeholder="Port Miami" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="destination_port"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Puerto de Destino</FieldLabel>
                        <Input {...field} placeholder="Mariel" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="provider_id"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Proveedor</FieldLabel>
                        <ProvidersCombobox
                           selectedProvider={field.value}
                           setSelectedProvider={(id) => field.onChange(id)}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </FieldGroup>
         </ScrollArea>

         <FieldSeparator className="my-2" />
         <Field>
            <Button type="submit" form="form-create-container" disabled={createContainerMutation.isPending}>
               {createContainerMutation.isPending ? (
                  <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Guardando...
                  </>
               ) : (
                  "Crear Contenedor"
               )}
            </Button>
         </Field>
      </form>
   );
};
