import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { UserRoundPenIcon, UserRoundPlus } from "lucide-react";
import { useReceivers } from "@/hooks/use-receivers";
import { type Province, type City, type Receiver, receiverSchema } from "@/data/types";
import { isValidCubanCI } from "@/lib/cents-utils";
import { Separator } from "@/components/ui/separator";

import { useProvinces } from "@/hooks/use-provinces";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ReceiverFormDialog() {
   const { selectedReceiver } = useOrderStore(
      useShallow((state) => ({
         selectedReceiver: state.selectedReceiver,
      })),
   );

   const [isOpen, setIsOpen] = useState(false);

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>
            <Button variant="outline">
               {selectedReceiver ? <UserRoundPenIcon /> : <UserRoundPlus />}
               <span className="hidden xl:block">{selectedReceiver ? "Editar" : "Crear"}</span>
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="px-4">
               <DialogTitle>{selectedReceiver ? "Editar Destinatario" : "Nuevo Destinatario"}</DialogTitle>
               <DialogDescription>
                  {selectedReceiver
                     ? "Edita los datos del destinatario para que puedas usarlo en tus pedidos."
                     : "Agrega un nuevo destinatario para que puedas usarlo en tus pedidos."}
               </DialogDescription>
            </DialogHeader>
            <ReceiverForm selectedReceiver={selectedReceiver} setIsOpen={setIsOpen} />
         </DialogContent>
      </Dialog>
   );
}
const ReceiverForm = ({
   selectedReceiver,
   setIsOpen,
}: {
   selectedReceiver: Receiver | null;
   setIsOpen: (isOpen: boolean) => void;
}) => {
   const { data: provinces } = useProvinces();

   const { setSelectedReceiver, selectedCustomer } = useOrderStore(
      useShallow((state) => ({
         selectedReceiver: state.selectedReceiver,
         setSelectedReceiver: state.setSelectedReceiver,
         selectedCustomer: state.selectedCustomer,
      })),
   );
   const [isProvinceOpen, setIsProvinceOpen] = useState(false);
   const [isCityOpen, setIsCityOpen] = useState(false);
   const form = useForm<Receiver>({
      resolver: zodResolver(receiverSchema),
      defaultValues: {
         first_name: "",
         middle_name: "",
         last_name: "",
         second_last_name: "",
         ci: "",
         email: undefined,
         phone: "",
         mobile: "",
         address: "",
         province_id: undefined,
         city_id: undefined,
         passport: undefined,
      },
   });

   const ciQuery = useWatch({ control: form.control, name: "ci" });

   const { data: receiverByCI } = useReceivers.getByCI(ciQuery);

   useEffect(() => {
      if (receiverByCI && !selectedReceiver) {
         setSelectedReceiver(receiverByCI);
         setIsOpen(false);
         form.reset();
      }
   }, [receiverByCI]);

   useEffect(() => {
      selectedReceiver == null
         ? form.reset({
              first_name: "",
              middle_name: "",
              last_name: "",
              second_last_name: "",
              ci: "",
              email: undefined,
              phone: "",
              mobile: "",
              address: "",
              province_id: undefined,
              city_id: undefined,
              passport: undefined,
           })
         : form.reset({
              first_name: selectedReceiver.first_name,
              middle_name: selectedReceiver.middle_name ?? "",
              last_name: selectedReceiver.last_name,
              second_last_name: selectedReceiver.second_last_name,
              ci: selectedReceiver.ci,
              email: selectedReceiver.email ? selectedReceiver.email : undefined,
              phone: selectedReceiver.phone ? selectedReceiver.phone : undefined,
              mobile: selectedReceiver.mobile ? selectedReceiver.mobile : undefined,
              address: selectedReceiver.address ? selectedReceiver.address : undefined,
              province_id: selectedReceiver.province_id ? selectedReceiver.province_id : undefined,
              city_id: selectedReceiver.city_id ? selectedReceiver.city_id : undefined,
           });
   }, [selectedReceiver, form]);

   const provinceId = useWatch({ control: form.control, name: "province_id" });
   const cities = useMemo(() => {
      return provinces?.find((province: Province) => province.id === provinceId)?.cities;
   }, [provinceId, form]);

   const { mutate: createReceiver, isPending } = useReceivers.create(selectedCustomer?.id || 0, {
      onSuccess: (data: Receiver) => {
         setIsOpen(false);
         form.reset();
         setSelectedReceiver(data);
      },
      onError: (error: any) => {
         console.log("Error creating receipt:", error);
      },
   });

   const { mutate: updateReceiver, isPending: isUpdating } = useReceivers.update({
      onSuccess: (data: Receiver) => {
         setIsOpen(false);
         form.reset();
         setSelectedReceiver(data);
      },
      onError: (error: any) => {
         console.log("Error updating receiver:", error);
      },
   });

   const onSubmit = (data: Receiver) => {
      if (data?.email === "") {
         data.email = undefined;
      }
      data.mobile = data.mobile ? `53${data.mobile}` : undefined;

      if (selectedReceiver) {
         updateReceiver({ id: selectedReceiver.id || 0, data });
      } else {
         createReceiver(data as Receiver);
      }
   };

  
   return (
      <form id="receiver-form" onSubmit={form.handleSubmit(onSubmit)}>
         <ScrollArea className="h-[calc(100vh-200px)] p-4">
            <FieldGroup className="my-2">
               <Field orientation="vertical">
                  <Controller
                     control={form.control}
                     name="ci"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="ci">
                              Carne de Identidad
                              {!isValidCubanCI(field.value) ? (
                                 <span className="text-destructive">*</span>
                              ) : (
                                 <span className="98 text-green-600">*</span>
                              )}
                           </FieldLabel>
                           <InputOTP
                              disabled={isPending || isUpdating}
                              onComplete={(value) => {
                                 field.onChange(value);
                              }}
                              className="w-full "
                              maxLength={11}
                              pattern="[0-9]*"
                              {...field}
                           >
                              <InputOTPGroup>
                                 <InputOTPSlot index={0} />
                                 <InputOTPSlot index={1} />
                                 <InputOTPSlot index={2} />
                                 <InputOTPSlot index={3} />
                                 <InputOTPSlot index={4} />
                                 <InputOTPSlot index={5} />
                                 <InputOTPSlot index={6} />
                                 <InputOTPSlot index={7} />
                                 <InputOTPSlot index={8} />
                                 <InputOTPSlot index={9} />
                                 <InputOTPSlot index={10} />
                              </InputOTPGroup>
                           </InputOTP>
                           <FieldDescription>Ingresa los 11 dígitos del carne de identidad</FieldDescription>

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Separator />

               <Field orientation="horizontal">
                  <Controller
                     control={form.control}
                     name="first_name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="first_name">Nombre</FieldLabel>

                           <Input {...field} />

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="middle_name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="middle_name">Segundo Nombre (Opcional)</FieldLabel>

                           <Input {...field} />

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Field orientation="horizontal">
                  <Controller
                     control={form.control}
                     name="last_name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="last_name">Apellido</FieldLabel>
                           <Input {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="second_last_name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="second_last_name">Segundo Apellido</FieldLabel>
                           <Input {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Field orientation="horizontal">
                  <Controller
                     control={form.control}
                     name="mobile"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="mobile">Teléfono Celular</FieldLabel>

                           <div className="flex">
                              <span className="inline-flex items-center px-3 text-sm border  border-r-0  rounded-l-md">
                                 +53
                              </span>
                              <Input
                                 id="mobile"
                                 {...field}
                                 type="tel"
                                 maxLength={8}
                                 pattern="[0-9]{8}"
                                 className="rounded-l-none"
                                 placeholder="12345678"
                                 onChange={(e) => {
                                    // Only allow digits and limit to 8 characters
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                                    field.onChange(value);
                                 }}
                              />
                           </div>

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="phone"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="phone">Teléfono</FieldLabel>

                           <div className="flex">
                              <Input
                                 id="phone"
                                 {...field}
                                 type="tel"
                                 maxLength={8}
                                 pattern="[0-9]{8}"
                                 placeholder="12345678"
                                 onChange={(e) => {
                                    // Only allow digits and limit to 8 characters
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                                    field.onChange(value);
                                 }}
                              />
                           </div>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>

               <Separator />
               <Field orientation="horizontal">
                  <Controller
                     control={form.control}
                     name="province_id"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="province_id">Provincia</FieldLabel>
                           <Popover modal={true} open={isProvinceOpen} onOpenChange={setIsProvinceOpen}>
                              <PopoverTrigger asChild>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                       "w-full lg:w-[200px] justify-between",
                                       !field.value && "text-muted-foreground",
                                    )}
                                 >
                                    {field.value
                                       ? provinces?.find((province: Province) => province.id === field.value)?.name
                                       : "Seleccionar Provincia"}
                                    <ChevronsUpDown className="opacity-50" />
                                 </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                 <Command>
                                    <CommandInput placeholder="Buscar Provincia..." className="h-9" />
                                    <CommandList>
                                       <CommandEmpty>No Provincias encontradas.</CommandEmpty>
                                       <CommandGroup className="max-h-60 overflow-y-auto">
                                          {provinces?.map((province: Province) => (
                                             <CommandItem
                                                value={province.name}
                                                key={province.id}
                                                onSelect={() => {
                                                   form.setValue("province_id", province.id);
                                                   setIsProvinceOpen(false);
                                                }}
                                             >
                                                {province.name}
                                                <Check
                                                   className={cn(
                                                      "ml-auto",
                                                      province.id === field.value ? "opacity-100" : "opacity-0",
                                                   )}
                                                />
                                             </CommandItem>
                                          ))}
                                       </CommandGroup>
                                    </CommandList>
                                 </Command>
                              </PopoverContent>
                           </Popover>

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     control={form.control}
                     name="city_id"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="city_id">Municipio</FieldLabel>
                           <Popover modal={true} open={isCityOpen} onOpenChange={setIsCityOpen}>
                              <PopoverTrigger asChild>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                       "w-full lg:w-[200px] justify-between",
                                       !field.value && "text-muted-foreground",
                                    )}
                                 >
                                    {field?.value
                                       ? cities?.find((city: City) => city.id === field.value)?.name
                                       : "Seleccionar Municipio"}
                                    <ChevronsUpDown className="opacity-50" />
                                 </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                 <Command>
                                    <CommandInput placeholder="Buscar Municipio..." className="h-9" />
                                    <CommandList>
                                       <CommandEmpty>No Municipios encontrados.</CommandEmpty>
                                       <CommandGroup>
                                          {cities?.map((city: City) => (
                                             <CommandItem
                                                value={city.name}
                                                key={city.id}
                                                onSelect={() => {
                                                   form.setValue("city_id", city.id);
                                                   setIsCityOpen(false);
                                                }}
                                             >
                                                {city.name}
                                                <Check
                                                   className={cn(
                                                      "ml-auto",
                                                      city.id === field.value ? "opacity-100" : "opacity-0",
                                                   )}
                                                />
                                             </CommandItem>
                                          ))}
                                       </CommandGroup>
                                    </CommandList>
                                 </Command>
                              </PopoverContent>
                           </Popover>

                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
               <Field orientation="vertical">
                  <Controller
                     control={form.control}
                     name="address"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="address">Dirección </FieldLabel>
                           <Input {...field} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </Field>
            </FieldGroup>
         </ScrollArea>
         <DialogFooter className="px-4">
            <Button type="submit" disabled={isPending || isUpdating}>
               {isPending || isUpdating ? "Guardando..." : "Guardar"}
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
         </DialogFooter>
      </form>
   );
};
