import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";
import {
   Dialog,
   DialogTrigger,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { dollarsToCents } from "@/lib/cents-utils";
import { Controller } from "react-hook-form";
import type { Discount } from "@/data/types";
import { zodResolver } from "@hookform/resolvers/zod";

const discountSchema = z.object({
   type: z.enum(["CASH", "PERCENT", "RATE"], {
      message: "El tipo de descuento es requerido",
   }),
   amount_in_cents: z
      .union([z.number(), z.undefined()])
      .refine((val) => val !== undefined, {
         message: "La cantidad es requerida",
      })
      .refine((val) => val === undefined || val >= 0.01, {
         message: "La cantidad debe ser mayor a 0",
      }),
   description: z.string().optional(),
   rate: z.number().optional(),
});

export const DiscountDialog = ({ order_id }: { order_id: number }) => {
   const [open, setOpen] = useState(false);
   const form = useForm<{
      type: "CASH" | "PERCENT" | "RATE";
      amount_in_cents: number | undefined;
      description?: string;
      rate?: number;
   }>({
      resolver: zodResolver(discountSchema),
      mode: "onBlur",
      defaultValues: {
         type: "RATE",
         amount_in_cents: undefined,
         description: "",
      },
   });
   const { mutate: createDiscount, isPending: isCreating } = useOrders.addDiscount(order_id, {
      onSuccess: () => {
         toast.success("Discount created successfully");
         form.reset({
            type: "RATE",
            amount_in_cents: undefined,
            description: "",
         });
         setOpen(false);
      },
      onError: (error: any) => {
         const errorMessage = error?.response?.data?.message || error?.message || "Failed to create discount";
         toast.error(errorMessage);
      },
   });
   const onSubmit = (data: {
      type: "CASH" | "PERCENT" | "RATE";
      amount_in_cents: number | undefined;
      description?: string;
      rate?: number;
   }) => {
      if (data.amount_in_cents === undefined) {
         return;
      }
      createDiscount({
         type: data.type,
         description: data.description,
         rate: data.rate,
         discount_in_cents: dollarsToCents(data.amount_in_cents),
      });
   };
   return (
      <Dialog
         open={open}
         onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
               form.reset({
                  type: "RATE",
                  amount_in_cents: undefined,
                  description: "",
               });
            }
         }}
      >
         <DialogTrigger>
            <Button disabled={isCreating} size="icon" variant="ghost">
               <PlusCircle className="size-4" />
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Agregar Descuento</DialogTitle>
               <DialogDescription>Agregar un nuevo descuento a la Orden.</DialogDescription>
            </DialogHeader>
            <form id="form-discount" onSubmit={form.handleSubmit(onSubmit)}>
               <FieldGroup>
                  <Controller
                     control={form.control}
                     name="type"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid ? true : false} id="type">
                           <FieldLabel>Tipo de Descuento</FieldLabel>
                           <Select
                              value={field.value}
                              onValueChange={(value) => field.onChange(value as Discount["type"])}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="RATE">Tarifa</SelectItem>
                                 <SelectItem value="CASH">Dinero</SelectItem>
                                 <SelectItem value="PERCENT">Porcentaje</SelectItem>
                              </SelectContent>
                           </Select>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="amount_in_cents"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="amount_in_cents">Cantidad</FieldLabel>
                           <InputGroup>
                              <InputGroupAddon>
                                 <InputGroupText>$</InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput
                                 {...field}
                                 type="number"
                                 step="0.01"
                                 min="0"
                                 className="text-right"
                                 placeholder="0.00"
                                 value={field.value ?? ""}
                                 onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === "" ? undefined : Number(value));
                                 }}
                               
                              />
                              <InputGroupAddon align="inline-end">
                                 <InputGroupText>USD</InputGroupText>
                              </InputGroupAddon>
                           </InputGroup>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     control={form.control}
                     name="description"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel>Descripción (Opcional)</FieldLabel>
                           <Input {...field} type="text" placeholder="Descripción del descuento" name={field.name} />
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
               </FieldGroup>
            </form>
            <Separator />
            <DialogFooter>
               <Field orientation="responsive">
                  <Button type="submit" form="form-discount" disabled={isCreating }>
                     {isCreating ? (
                        <>
                           <Spinner className="size-4" /> Creando Descuento...
                        </>
                     ) : (
                        "Agregar Descuento"
                     )}
                  </Button>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => {
                        setOpen(false);
                        form.reset({
                           type: "RATE",
                           amount_in_cents: undefined,
                           description: "",
                        });
                     }}
                     disabled={isCreating}
                  >
                     Cerrar
                  </Button>
               </Field>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
