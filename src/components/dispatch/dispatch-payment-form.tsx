import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DollarSign, DollarSignIcon } from "lucide-react";
import { useDispatches } from "@/hooks/use-dispatches";
import { PaymentMethodCombobox } from "@/components/orders/payments/payment-methods-combobox";
import { centsToDollars, dollarsToCents, formatCents } from "@/lib/cents-utils";
import { toast } from "sonner";
import type { Dispatch } from "@/data/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { payment_methods } from "@/data/data";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

function dispatchPaymentFormSchema(maxDollars: number) {
   return z.object({
      amount_in_cents: z
         .number()
         .min(0.01, "El monto debe ser mayor a 0")
         .max(maxDollars, `El monto no puede superar el saldo pendiente ($${maxDollars.toFixed(2)})`),
      method: z.string().min(1, "Selecciona un método de pago"),
      reference: z.string().optional(),
      notes: z.string().optional(),
   });
}

type DispatchPaymentFormValues = z.infer<ReturnType<typeof dispatchPaymentFormSchema>>;

function getErrorMessage(error: unknown): string {
   const err = error as { response?: { data?: { message?: string } }; message?: string };
   return err?.response?.data?.message ?? err?.message ?? "Error al registrar el pago";
}

export function DispatchPaymentForm({ dispatch }: { dispatch: Dispatch }): React.ReactElement {
   const remainingCents = (dispatch?.cost_in_cents ?? 0) - (dispatch?.paid_in_cents ?? 0);
   const remainingDollars = centsToDollars(remainingCents);
   const maxDollars = (remainingDollars * 100) / 100;

   const form = useForm<DispatchPaymentFormValues>({
      resolver: zodResolver(dispatchPaymentFormSchema(maxDollars)),
      defaultValues: {
         amount_in_cents: Math.min(remainingDollars, maxDollars) || 0,
         method: payment_methods[0]?.id ?? "CASH",
         reference: "",
         notes: "",
      },
   });

   const [open, setOpen] = useState(false);

   useEffect(() => {
      if (open) {
         form.reset({
            amount_in_cents: remainingDollars > 0 ? Math.round(remainingDollars * 100) / 100 : 0,
            method: payment_methods[0]?.id ?? "CASH",
            reference: "",
            notes: "",
         });
      }
   }, [open, remainingDollars, form]);

   const addPaymentMutation = useDispatches.addPayment(dispatch.id);

   const onSubmit = (data: DispatchPaymentFormValues): void => {
      const amountCents = dollarsToCents(data.amount_in_cents);
      if (amountCents <= 0) {
         toast.error("El monto debe ser mayor a 0");
         return;
      }
      if (amountCents > remainingCents) {
         toast.error(
            `El monto ($${(amountCents / 100).toFixed(2)}) supera el saldo pendiente ($${(remainingCents / 100).toFixed(2)})`
         );
         return;
      }
      addPaymentMutation.mutate(
         {
            amount_in_cents: amountCents,
            method: data.method,
            reference: data.reference || undefined,
            notes: data.notes || undefined,
         },
         {
            onSuccess: () => {
               toast.success("Pago registrado correctamente");
               setOpen(false);
               form.reset();
            },
            onError: (error) => {
               const msg = getErrorMessage(error);
               toast.error(msg);
            },
         }
      );
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="default" className="print:hidden w-full">
               <DollarSign className="w-4 h-4" />
               <span className="md:block">Agregar pago</span>
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Agregar pago</DialogTitle>
               <DialogDescription>Registrar un pago para este despacho</DialogDescription>
            </DialogHeader>

            <Card className="flex flex-row justify-evenly">
               <div className="flex flex-col items-center gap-2">
                  <span className="font-medium text-muted-foreground">Total a pagar</span>
                  <span className="font-medium text-muted-foreground">
                     {formatCents(dispatch?.cost_in_cents ?? 0)}
                  </span>
               </div>
               <Separator orientation="vertical" />
               <div className="flex flex-col items-center gap-2">
                  <span className="font-medium">Pendiente</span>
                  <span className="font-medium">{formatCents(remainingCents)}</span>
               </div>
            </Card>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6">
                  <PaymentMethodCombobox />
                  <Controller
                     control={form.control}
                     name="reference"
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel>Referencia (opcional)</FieldLabel>
                           <InputGroup>
                              <InputGroupInput
                                 className="text-right"
                                 placeholder="Referencia"
                                 {...field}
                                 value={field.value ?? ""}
                                 data-invalid={fieldState.invalid}
                              />
                           </InputGroup>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     control={form.control}
                     name="amount_in_cents"
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel>Monto (máx. {formatCents(remainingCents)})</FieldLabel>
                           <InputGroup>
                              <InputGroupInput
                                 className="text-right"
                                 placeholder="0.00"
                                 type="number"
                                 step="0.01"
                                 min={0}
                                 max={maxDollars}
                                 {...field}
                                 onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                 data-invalid={fieldState.invalid}
                              />
                              <InputGroupAddon>
                                 <DollarSignIcon />
                              </InputGroupAddon>
                           </InputGroup>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Controller
                     control={form.control}
                     name="notes"
                     render={({ field }) => (
                        <Field>
                           <FieldLabel>Notas (opcional)</FieldLabel>
                           <InputGroup>
                              <InputGroupInput
                                 placeholder="Notas"
                                 {...field}
                                 value={field.value ?? ""}
                              />
                           </InputGroup>
                        </Field>
                     )}
                  />

                  <Button type="submit" disabled={addPaymentMutation.isPending}>
                     {addPaymentMutation.isPending ? (
                        <div className="flex items-center gap-2">
                           <Spinner /> Procesando...
                        </div>
                     ) : (
                        "Registrar pago"
                     )}
                  </Button>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
