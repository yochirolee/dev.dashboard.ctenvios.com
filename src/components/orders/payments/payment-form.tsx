import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, DollarSign } from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { payment_methods } from "@/data/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, centsToDollars, dollarsToCents } from "@/lib/utils";
import { paymentSchema } from "@/data/types";
import { toast } from "sonner";
import { type OrderInvoice } from "@/data/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentProcessing } from "./processing-payment";

export const PaymentForm = ({ invoice }: { invoice: OrderInvoice }) => {
   const balance = ((centsToDollars(invoice?.total_in_cents - invoice?.paid_in_cents))).toFixed(2);

   console.log(invoice, "invoice");

   const form = useForm<z.infer<typeof paymentSchema>>({
      resolver: zodResolver(paymentSchema),
      defaultValues: {
         amount_in_cents: Number(balance),
         charge_in_cents: 0,
         method: payment_methods[0].value,
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

   const { mutate: createPayment, isPending } = useInvoices.pay({
      onSuccess: () => {
         toast.success("Payment created successfully");
         form.reset({});
         setOpen(false);
      },
      onError: (error: any) => {
         toast.error(error.response.data.message);
      },
   });

   const onSubmit = (data: z.infer<typeof paymentSchema>) => {
      data.amount_in_cents = dollarsToCents(data.amount_in_cents);
      data.charge_in_cents = dollarsToCents(data.charge_in_cents ?? 0);
      createPayment({ invoice_id: Number(invoice.id), data });
   };

   const [open, setOpen] = useState(false);
   useEffect(() => {
      form.reset({
         amount_in_cents: Number(balance),
         charge_in_cents: 0,
         reference: undefined,
         notes: undefined,
         method: payment_methods[0].value as "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "ZELLE" | "OTHER",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="@container/card">
                  <CardHeader>
                     <CardDescription>Total de la factura</CardDescription>
                     <CardTitle className="text-2xl font-semibold text-muted-foreground tabular-nums @[250px]/card:text-3xl">
                        ${centsToDollars(invoice?.total_in_cents)}
                     </CardTitle>
                  </CardHeader>
               </Card>
               <Card className="@container/card">
                  <CardHeader>
                     <CardDescription>Pendiente de Pago</CardDescription>
                     <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        ${balance}
                     </CardTitle>
                  </CardHeader>
               </Card>
            </div>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8">
                  <PaymentMethodCombobox />

                  <FormField
                     control={form.control}
                     name="reference"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Referencia de pago</FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="Referencia de pago" />
                           </FormControl>
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="amount_in_cents"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Amount</FormLabel>

                           <Input
                              {...form.register(`amount_in_cents`, {
                                 valueAsNumber: true,
                              })}
                              placeholder="0.00"
                              type="number"
                              min={0}
                              max={Number(balance) + (form.getValues("charge_in_cents") ?? 0)}
                              step={0.01}
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                           />

                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <div className="flex flex-col  justify-end  gap-2">
                     <div className="flex  justify-between gap-2">
                        <span className="font-medium justify-end">Cargo por tarjeta:</span>{" "}
                        <span className="font-medium justify-end">
                           ${form.getValues("charge_in_cents")?.toFixed(2) ?? 0.0}
                        </span>
                     </div>
                     <div className="flex  justify-between gap-2">
                        <span className="font-medium ">Total a pagar:</span>{" "}
                        <span className="font-medium ">
                           ${(amount + (form.getValues("charge_in_cents") ?? 0)).toFixed(2)}
                        </span>
                     </div>
                  </div>

                  {isPending ? (
                     <PaymentProcessing amount={amount} charge={centsToDollars(form.getValues("charge_in_cents") ?? 0)} />
                  ) : (
                     <Button type="submit" disabled={isPending}>
                        Pagar
                     </Button>
                  )}
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};

const PaymentMethodCombobox = () => {
   const form = useFormContext();
   const [open, setOpen] = useState(false);
   return (
      <FormField
         control={form.control}
         name="method"
         render={({ field }) => (
            <FormItem>
               <FormLabel>Método de pago</FormLabel>

               <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                     <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {field.value
                           ? payment_methods.find((payment_method) => payment_method.value === field.value)?.label
                           : "Select payment method"}
                        <ChevronsUpDown className="opacity-50" />
                     </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                     <Command>
                        <CommandInput placeholder="Search payment method..." className="h-9" />
                        <CommandList>
                           <CommandEmpty>No payment method found.</CommandEmpty>
                           <CommandGroup>
                              {payment_methods.map((method) => (
                                 <CommandItem
                                    key={method.value}
                                    value={method.value}
                                    onSelect={(currentValue) => {
                                       form.setValue(field.name, currentValue);
                                       setOpen(false);
                                    }}
                                 >
                                    {method.label}
                                    <Check
                                       className={cn(
                                          "ml-auto",
                                          field.value === method.value ? "opacity-100" : "opacity-0"
                                       )}
                                    />
                                 </CommandItem>
                              ))}
                           </CommandGroup>
                        </CommandList>
                     </Command>
                  </PopoverContent>
               </Popover>
            </FormItem>
         )}
      />
   );
};
