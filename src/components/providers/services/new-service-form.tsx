import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Provider } from "@/data/types";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

const formNewServiceSchema = z.object({
   name: z.string().min(1, { message: "El nombre del servicio es requerido" }),
   description: z.string().min(1, { message: "La descripción del servicio es requerida" }),
   service_type: z.enum(["MARITIME", "AIR"]),
   provider_id: z.number().min(1, { message: "El proveedor es requerido" }),
   forwarder_id: z.number().min(1, { message: "El forwarder es requerido" }),
   is_active: z.boolean(),
});

type FormNewServiceSchema = z.infer<typeof formNewServiceSchema>;

export const NewServiceForm = ({
   open,
   setOpen,
   provider,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   provider: Provider;
}) => {
   const form = useForm<FormNewServiceSchema>({
      resolver: zodResolver(formNewServiceSchema),
      defaultValues: {
         name: "",
         description: "",
         service_type: "MARITIME",
         provider_id: provider?.id ?? 0,
         forwarder_id: 1,
         is_active: true,
      },
   });
   const { mutate: createService, isPending } = useServices.create({
      onSuccess: () => {
         form.reset();
         toast.success("Servicio creado correctamente");
         setOpen(false);
      },
      onError: (error) => {
         toast.error(error.response.data.message);
      },
   });

   console.log(form.formState.errors);
   const onSubmit = (data: FormNewServiceSchema) => {
      createService(data);
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="outline">
               <Plus className="w-4 h-4" />
               <span>Crear Servicio</span>
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Crear Servicio</DialogTitle>
               <DialogDescription>Agrega un nuevo servicio para {provider?.name}</DialogDescription>
            </DialogHeader>
            <form id="form-new-service" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FieldGroup>
                  <Controller
                     control={form.control}
                     name="name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel>Nombre</FieldLabel>
                           <Input {...field} placeholder="Nombre del Servicio" />
                        </Field>
                     )}
                  />
               </FieldGroup>
               <FieldGroup>
                  <Controller
                     control={form.control}
                     name="description"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel>Descripción</FieldLabel>
                           <Input {...field} placeholder="Descripción del servicio" />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </FieldGroup>
               <FieldGroup>
                  <Controller
                     control={form.control}
                     name="service_type"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel>Tipo de servicio</FieldLabel>
                           <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Selecciona un tipo de servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="MARITIME">Marítimo</SelectItem>
                                 <SelectItem value="AIR">Aéreo</SelectItem>
                              </SelectContent>
                           </Select>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </FieldGroup>
               <FieldSeparator className="my-2" />
               <Field>
                  <Button type="submit" form="form-new-service" disabled={isPending}>
                     {isPending ? (
                        <>
                           <Spinner />
                           Creando servicio...
                        </>
                     ) : (
                        "Crear Servicio"
                     )}
                  </Button>
               </Field>
            </form>
         </DialogContent>
      </Dialog>
   );
};
