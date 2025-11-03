import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useProviders } from "@/hooks/use-providers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field";
import { ScrollArea } from "../ui/scroll-area";

const formNewProviderSchema = z.object({
   name: z.string().min(1, { message: "El nombre del proveedor es requerido" }),
   address: z.string().min(1, { message: "La dirección es requerida" }),
   phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }),
   contact: z.string().min(1),
   email: z.string().email({ message: "El email no es válido" }),
   website: z.string().url({ message: "La URL no es válida" }).optional(),
   forwarder_id: z.number().optional(),
});

type FormNewProviderSchema = z.infer<typeof formNewProviderSchema>;

export const NewProviderForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
   const form = useForm<FormNewProviderSchema>({
      resolver: zodResolver(formNewProviderSchema),
      defaultValues: {
         name: "",
         address: "",
         phone: "",
         contact: "",
         email: "",
         website: "",
         forwarder_id: 1,
      },
   });
   const { mutate: createProvider, isPending } = useProviders.create({
      onSuccess: () => {
         form.reset();
         toast.success("Proveedor creado correctamente");
         setOpen(false);
      },
      onError: (error) => {
         toast.error(error.response.data.message);
      },
   });
   const onSubmit = (data: FormNewProviderSchema) => {
      createProvider(data);
   };

   return (
      <form id="form-create-provider" onSubmit={form.handleSubmit(onSubmit)}>
         <ScrollArea className="h-[calc(100vh-100px)] lg:h-auto p-4">
            <FieldGroup>
               <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                     <Field>
                        <FieldLabel>Nombre</FieldLabel>
                        <Input {...field} placeholder="Nombre del proveedor" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="address"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Dirección</FieldLabel>
                        <Input {...field} placeholder="Dirección del proveedor" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Teléfono</FieldLabel>
                        <Input {...field} placeholder="Teléfono del proveedor" type="tel" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  control={form.control}
                  name="contact"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Contacto</FieldLabel>
                        <Input {...field} placeholder="Contacto del proveedor" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Email</FieldLabel>
                        <Input {...field} placeholder="example@example.com" type="email" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Controller
                  control={form.control}
                  name="website"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Website</FieldLabel>
                        <Input {...field} placeholder="Website del proveedor" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </FieldGroup>
         </ScrollArea>

         <FieldSeparator className="my-2" />
         <Field>
            <Button type="submit" form="form-create-provider" disabled={isPending}>
               {isPending ? (
                  <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Guardando...
                  </>
               ) : (
                  "Crear Proveedor"
               )}
            </Button>
         </Field>
      </form>
   );
};
