import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogTitle,
   DialogHeader,
   DialogTrigger,
   DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useCustoms } from "@/hooks/use-customs";
import type { Customs } from "@/data/types";
import { customsRatesSchema } from "@/data/types";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { FieldLabel, FieldError } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
type FormData = z.input<typeof customsRatesSchema>;

export function NewCustomsForm({
   customsRate,
   setCustomsRate,
   open,
   setOpen,
}: {
   customsRate: Customs | undefined;
   setCustomsRate: (customsRate: Customs | undefined) => void;
   open: boolean;
   setOpen: (open: boolean) => void;
}) {
   const form = useForm<FormData>({
      resolver: zodResolver(customsRatesSchema),
      defaultValues: {
         name: "",
         description: "",
         chapter: "",
         country_id: 1,
         fee_type: "UNIT",
         fee_in_cents: undefined,
         insurance_fee_in_cents: undefined,
         min_weight: 0,
         max_weight: 0,
         max_quantity: 0,
      },
   });

   const [isEditing, setIsEditing] = useState(false);

   useEffect(() => {
      if (customsRate) {
         form.reset({
            name: customsRate?.name,
            description: customsRate?.description,
            chapter: customsRate?.chapter,
            country_id: customsRate?.country_id,
            fee_type: customsRate?.fee_type,
            fee_in_cents: centsToDollars(customsRate?.fee_in_cents ?? 0),
            insurance_fee_in_cents: centsToDollars(customsRate?.insurance_fee_in_cents ?? 0),
            min_weight: customsRate?.min_weight ?? 0,
            max_weight: customsRate?.max_weight ?? 0,
            max_quantity: customsRate?.max_quantity ?? 0,
         });
         setIsEditing(true);
      } else {
         form.reset({
            name: "",
            description: "",
            chapter: "",
            country_id: 1,
            fee_type: "UNIT",
            fee_in_cents: undefined,
            insurance_fee_in_cents: undefined,
            min_weight: 0,
            max_weight: 0,
            max_quantity: 0,
         });
         setIsEditing(false);
      }
   }, [customsRate, open]);

   const createCustomsMutation = useCustoms.create();
   const updateCustomsMutation = useCustoms.update();
   const onSubmit = async (data: FormData) => {
      const feeInCents = dollarsToCents(data.fee_in_cents ?? 0);
      const insuranceFeeInCents = dollarsToCents(data.insurance_fee_in_cents ?? 0);
       console.log(data);
      if (customsRate) {
         updateCustomsMutation.mutate(
            {
               id: customsRate?.id,
               data: { ...data, fee_in_cents: feeInCents, insurance_fee_in_cents: insuranceFeeInCents },
            } as {
               id: number;
               data: Customs;
            },
            {
               onSuccess: () => {
                  setOpen(false);
                  setCustomsRate(undefined);
                  form.reset();
               },
            }
         );
      } else {
         createCustomsMutation.mutate(
            { ...data, fee_in_cents: feeInCents, insurance_fee_in_cents: insuranceFeeInCents } as Customs,
            {
               onSuccess: () => {
                  setCustomsRate(undefined);
                  setOpen(false);
                  form.reset();
               },
            }
         );
      }
   };

   return (
      <Dialog
         open={open}
       
         onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
               form.reset();
               setCustomsRate(undefined);
            }
         }}
      >
         <DialogTrigger asChild>
            <Button variant="outline">
               <PlusCircle className="w-4 h-4" />
               <span className="hidden md:block">{"Crear Arancel"}</span>
            </Button>
         </DialogTrigger>

         <DialogContent className="sm:max-w-[550px] p-4 ">
            <DialogHeader className="px-4">
               <DialogTitle>Crear Arancel</DialogTitle>
               <DialogDescription>Crea un nuevo Arancel para la plataforma</DialogDescription>
            </DialogHeader>

            <form id="form-new-customs" onSubmit={form.handleSubmit(onSubmit)}>
               <ScrollArea className="h-[calc(100vh-200px)] p-4">
                  <div className="space-y-6">
                     <Controller
                        control={form.control}
                        name="name"
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Nombre</FieldLabel>
                              <Input {...field} placeholder="Nombre del Arancel" type="text" required />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                           </Field>
                        )}
                     />
                     <Controller
                        control={form.control}
                        name="description"
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Descripción</FieldLabel>
                              <Input {...field} placeholder="Descripción del Arancel" required />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                           </Field>
                        )}
                     />

                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="fee_type"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Tipo de Fee</FieldLabel>
                                 <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full">
                                       <SelectValue placeholder="Selecciona un tipo de fee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="UNIT">Unitario</SelectItem>
                                       <SelectItem value="WEIGHT">Peso</SelectItem>
                                       <SelectItem value="VALUE">Valor</SelectItem>
                                    </SelectContent>
                                 </Select>
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="fee_in_cents"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Fee</FieldLabel>
                                 <Input
                                    {...field}
                                    placeholder="0.00"
                                    type="number"
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                 />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="insurance_fee_in_cents"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Seguro</FieldLabel>
                                 <Input
                                    {...field}
                                    placeholder="0.00"
                                    type="number"
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                 />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="max_weight"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Peso Maximo</FieldLabel>
                                 <Input
                                    {...field}
                                    placeholder="0.00"
                                    type="number"
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                 />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="min_weight"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Peso Minimo</FieldLabel>
                                 <Input
                                    {...field}
                                    placeholder="0.00"
                                    type="number"
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                 />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                     <div className="flex flex-col w-full gap-2">
                        <Controller
                           control={form.control}
                           name="max_quantity"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel>Cantidad Max Permitida</FieldLabel>
                                 <Input
                                    {...field}
                                    placeholder="0"
                                    type="number"
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                 />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </div>
                  </div>
               </ScrollArea>

               <DialogFooter>
                  <div className="flex flex-col gap-2 w-full	">
                     <Button
                        type="submit"
                        className="w-full"
                        disabled={createCustomsMutation.isPending || updateCustomsMutation.isPending}
                     >
                        {createCustomsMutation.isPending || updateCustomsMutation.isPending
                           ? "Creando..."
                           : isEditing
                           ? "Actualizar"
                           : "Crear"}
                     </Button>
                     <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                           setOpen(false);
                           form.reset();
                           setCustomsRate(undefined);
                           setIsEditing(false);
                        }}
                     >
                        Cancelar
                     </Button>
                  </div>
                  {createCustomsMutation.error && (
                     <Alert variant="destructive">{createCustomsMutation.error.message}</Alert>
                  )}
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
