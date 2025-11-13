import { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DollarSign, DollarSignIcon } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { PaymentMethodCombobox } from "./payment-methods-combobox";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";
import { paymentSchema } from "@/data/types";
import { toast } from "sonner";
import { type Order } from "@/data/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { payment_methods } from "@/data/data";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
export const PaymentForm = ({ order }: { order: Order }) => {
   const balance = centsToDollars(order?.total_in_cents - order?.paid_in_cents).toFixed(2);

   const form = useForm<z.infer<typeof paymentSchema>>({
      resolver: zodResolver(paymentSchema),
      defaultValues: {
         amount_in_cents: Number(balance),
         charge_in_cents: 0,
         method: payment_methods[0].id,
         reference: undefined,
         notes: undefined,
      },
   });

   const amount = useWatch({
      control: form.control,
      name: "amount_in_cents",
   });

   const payment_method = useWatch({
      control: form.control,
      name: "method",
   });

   if (payment_method === "CREDIT_CARD" || payment_method === "DEBIT_CARD") {
      form.setValue("charge_in_cents", amount * 0.03);
   } else {
      form.setValue("charge_in_cents", 0);
   }

   const { mutate: createPayment, isPending } = useOrders.payOrder({
      onSuccess: () => {
         toast.success("Payment created successfully");
         form.reset({});
         setOpen(false);
      },
      onError: (error: any) => {
         console.log(error, "error in payment creation");
         toast.error(error.response.data.message);
      },
   });

   const onSubmit = (data: z.infer<typeof paymentSchema>) => {
      data.amount_in_cents = dollarsToCents(data.amount_in_cents);
      data.charge_in_cents = dollarsToCents(data.charge_in_cents ?? 0);
      createPayment({ order_id: Number(order.id), data });
   };

   const [open, setOpen] = useState(false);
   useEffect(() => {
      form.reset({
         amount_in_cents: Number(balance),
         charge_in_cents: 0,
         reference: undefined,
         notes: undefined,
         method: payment_methods[0].id,
      });
   }, [open, form]);

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="default" className="print:hidden w-full">
               <DollarSign className="w-4 h-4" />
               <span className=" md:block">Pagar</span>
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Pagar</DialogTitle>
               <DialogDescription>Pagar la factura</DialogDescription>
            </DialogHeader>

            <Card className="flex flex-row justify-evenly">
               <div className="flex flex-col items-center  gap-2">
                  <span className="font-medium text-muted-foreground">Total de la factura</span>
                  <span className="font-medium text-muted-foreground">${centsToDollars(order?.total_in_cents)}</span>
               </div>
               <Separator orientation="vertical" />
               <div className="flex flex-col items-center  gap-2">
                  <span className="font-medium">Pendiente de pago</span>
                  <span className="font-medium">${balance}</span>
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
                           <FieldLabel>Referencia de pago</FieldLabel>
                           <InputGroup>
                              <InputGroupInput
                                 className="text-right"
                                 placeholder="Referencia de pago"
                                 {...field}
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
                           <FieldLabel>Monto a pagar</FieldLabel>
                           <InputGroup>
                              <InputGroupInput
                                 className="text-right"
                                 placeholder="Monto a pagar"
                                 {...field}
                                 data-invalid={fieldState.invalid}
                                 type="number"
                                 onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                              <InputGroupAddon>
                                 <DollarSignIcon />
                              </InputGroupAddon>
                           </InputGroup>
                           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                     )}
                  />
                  <Card className="flex flex-col  justify-end  gap-2">
                     <CardContent className="space-y-2">
                        <div className="flex  justify-between ">
                           <span className="text-sm text-muted-foreground">Payment fee:</span>{" "}
                           <span className="text-muted-foreground text-sm ">
                              ${form.getValues("charge_in_cents")?.toFixed(2) ?? 0.0}
                           </span>
                        </div>
                        <Separator />
                        <div className="flex  justify-between ">
                           <span className="font-medium ">Total Final:</span>{" "}
                           <span className="font-medium ">
                              ${(amount + (form.getValues("charge_in_cents") ?? 0)).toFixed(2)}
                           </span>
                        </div>
                     </CardContent>
                  </Card>

                  <Button type="submit" disabled={isPending}>
                     {isPending ? (
                        <div className="flex items-center gap-2">
                           <Spinner /> Procesando...
                        </div>
                     ) : (
                        "Pagar"
                     )}
                  </Button>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};
