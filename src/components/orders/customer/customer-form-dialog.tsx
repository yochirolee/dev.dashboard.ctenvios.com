import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UserRoundPenIcon, UserRoundPlus } from "lucide-react";
import * as z from "zod";
import { useCustomers } from "@/hooks/use-customers";
import { type Customer } from "@/data/types";
import { toast } from "sonner";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";

const customerFormSchema = z.object({
   first_name: z.string().min(1, { message: "El nombre es requerido" }),
   middle_name: z.string().optional(),
   last_name: z.string().min(1, { message: "El apellido es requerido" }),
   second_last_name: z.string().optional(),
   mobile: z
      .string()
      .min(10, { message: "El movil debe tener 10 dígitos" })
      .max(10, { message: "El movil debe tener 10 dígitos" }),
   identity_document: z.string().optional(),
   email: z.string().email({ message: "El correo electrónico no es válido" }).optional(),
   address: z.string().optional(),
});

type FormData = z.infer<typeof customerFormSchema>;

export const CustomerFormDialog = React.memo(function CustomerFormDialog() {
   const [isOpen, setIsOpen] = useState(false);
   const { selectedCustomer } = useOrderStore(
      useShallow((state) => ({
         selectedCustomer: state.selectedCustomer,
      }))
   );

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>
            <Button variant="outline">
               {selectedCustomer ? <UserRoundPenIcon /> : <UserRoundPlus />}
               <span className="hidden lg:block"> {selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"}</span>
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[550px] p-2  ">
            <DialogHeader className="px-4">
               <DialogTitle>{selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
               <DialogDescription>
                  {selectedCustomer
                     ? "Edita los datos del cliente para que puedas usarlo en tus pedidos."
                     : "Agrega un nuevo cliente para que puedas usarlo en tus pedidos."}
               </DialogDescription>
            </DialogHeader>

            <CustomerForm selectedCustomer={selectedCustomer} setIsOpen={setIsOpen} />
         </DialogContent>
      </Dialog>
   );
});

const CustomerForm = ({
   selectedCustomer,
   setIsOpen,
}: {
   selectedCustomer: Customer | null;
   setIsOpen: (isOpen: boolean) => void;
}) => {
   const form = useForm<FormData>({
      resolver: zodResolver(customerFormSchema),
      defaultValues: {
         first_name: "",
         email: undefined,
         mobile: undefined,
         middle_name: "",
         last_name: "",
         second_last_name: "",
         identity_document: undefined,
         address: undefined,
      },
   });

   useEffect(() => {
      console.log("customer form dialog");
      if (selectedCustomer == null) {
         form.reset({
            first_name: "",
            email: undefined,
            mobile: undefined,
            middle_name: "",
            last_name: "",
            second_last_name: "",
            identity_document: undefined,
            address: undefined,
         });
      } else {
         form.reset({
            first_name: selectedCustomer.first_name,
            email: selectedCustomer.email ? selectedCustomer.email : undefined,
            mobile: selectedCustomer.mobile ? selectedCustomer.mobile : undefined,
            middle_name: selectedCustomer.middle_name ? selectedCustomer.middle_name : undefined,
            last_name: selectedCustomer.last_name ? selectedCustomer.last_name : undefined,
            second_last_name: selectedCustomer.second_last_name,
            identity_document: selectedCustomer.identity_document ? selectedCustomer.identity_document : undefined,
            address: selectedCustomer.address ? selectedCustomer.address : undefined,
         });
      }
   }, [selectedCustomer, form]);

   const { mutate: updateCustomer, isPending: isUpdating } = useCustomers.update({
      onSuccess: (data: Customer) => {
         setIsOpen(false);
         toast.success("Cliente actualizado correctamente");
         form.reset();
         useInvoiceStore.setState({ selectedCustomer: data });
      },
   });

   const { mutate: createCustomer, isPending } = useCustomers.create({
      onSuccess: (data: Customer) => {
         setIsOpen(false);
         toast.success("Cliente creado correctamente");
         form.reset();
         useInvoiceStore.setState({ selectedCustomer: data });
      },
      onError: (error) => {
         toast.error(error.response.data.message);
      },
   });

   const onSubmit = (data: FormData) => {
      if (selectedCustomer !== null) {
         updateCustomer({ id: selectedCustomer.id, data: data as Customer });
      } else {
         createCustomer(data as Customer);
      }
   };

   const onError = (errors: any) => {
      console.log("Form validation errors:", errors);
   };

   console.log(form.formState.errors, "errors");

   return (
      <form id="customer-form" onSubmit={form.handleSubmit(onSubmit, onError)}>
         <ScrollArea className="h-[calc(100vh-200px)] lg:h-auto p-4 ">
            <FieldGroup>
               <Controller
                  name="mobile"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="mobile">Movil</FieldLabel>
                        <Input placeholder="Movil" id="mobile" {...field} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />

               <Field orientation="horizontal">
                  <Controller
                     name="first_name"
                     control={form.control}
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="first-name">Nombre</FieldLabel>
                           <Input placeholder="Nombre" id="first-name" {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     name="middle_name"
                     control={form.control}
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="middle-name">2do Nombre</FieldLabel>
                           <Input placeholder="2do Nombre" id="middle-name" {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Field orientation="horizontal">
                  <Controller
                     name="last_name"
                     control={form.control}
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="last-name">Apellido</FieldLabel>
                           <Input placeholder="Apellido" id="last-name" {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     name="second_last_name"
                     control={form.control}
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="second-last-name">2do Apellido</FieldLabel>
                           <Input placeholder="2do Apellido" id="second-last-name" {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Controller
                  name="identity_document"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="identity-document">Documento</FieldLabel>
                        <Input placeholder="Documento" id="identity-document" {...field} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                        <Input placeholder="Correo Electrónico" id="email" {...field} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="address">Dirección</FieldLabel>
                        <Input placeholder="Dirección" id="address" {...field} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </FieldGroup>
         </ScrollArea>

         <DialogFooter>
            <Field orientation="horizontal" className="w-full p-4 justify-end">
               <Button type="submit" disabled={isPending || isUpdating}>
                  {isPending || isUpdating ? "Guardando..." : selectedCustomer ? "Actualizar" : "Guardar"}
               </Button>
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                     form.reset();
                     setIsOpen(false);
                  }}
               >
                  Cancelar
               </Button>
            </Field>
         </DialogFooter>
      </form>
   );
};
