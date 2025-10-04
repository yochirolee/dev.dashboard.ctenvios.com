import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { Table, TableRow, TableHeader, TableCaption, TableHead, TableBody } from "../ui/table";
import { CardContent, CardHeader, CardTitle, Card } from "../ui/card";
import { Button } from "../ui/button";
import { Trash, PackagePlus, Loader2, PlusCircle, Scale, BoxIcon } from "lucide-react";
import ItemRow from "./item-row";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { invoiceSchema, type ShippingRate } from "@/data/types";
import { useInvoices } from "@/hooks/use-invoices";
import { Input } from "../ui/input";
import { useAppStore } from "@/stores/app-store";
import { Separator } from "../ui/separator";
import { ChargeDialog, DiscountDialog, InsuranceFeeDialog } from "./order-dialogs";
import { centsToDollars } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { dollarsToCents } from "@/lib/utils";

type FormValues = z.infer<typeof invoiceSchema>;

export function ItemsInOrder({ shipping_rates }: { shipping_rates: ShippingRate[] }) {
   const navigate = useNavigate();
   const user = useAppStore((state) => state.user);
   const [items_count, setItemsCount] = useState(1);
   const [dialogState, setDialogState] = useState({
      type: "" as "insurance" | "charge" | "rate" | "",
      index: 0 as number,
   });

   const {
      selectedCustomer,
      selectedReceiver,
      selectedService,
      setSelectedCustomer,
      setSelectedReceiver,
      setSelectedService,
   } = useInvoiceStore(
      useShallow((state) => ({
         selectedCustomer: state.selectedCustomer,
         selectedReceiver: state.selectedReceiver,
         setSelectedCustomer: state.setSelectedCustomer,
         setSelectedReceiver: state.setSelectedReceiver,
         setSelectedService: state.setSelectedService,
         selectedService: state.selectedService,
      }))
   );

   // Get the first rate from the rates array that type is WEIGHT
   //divide rates by type WEIGHT and FIXED
   const weight_rates = shipping_rates?.filter((rate) => rate.rate_type === "WEIGHT" && rate.min_weight == 1);
   const rate = weight_rates?.[0];

   const form = useForm<FormValues>({
      resolver: zodResolver(invoiceSchema) as any,
      defaultValues: {
         customer_id: selectedCustomer?.id || 0,
         receiver_id: selectedReceiver?.id || 0,
         agency_id: user?.agency_id || 0,
         user_id: user?.id || "",
         service_id: selectedService?.id || 0,

         items: [
            {
               description: "",
               weight: undefined,
               rate_in_cents: rate?.rate_in_cents || 0,
               cost_in_cents: rate?.cost_in_cents || 0,
               rate_id: rate?.id || undefined,
               rate_type: rate?.rate_type || "WEIGHT",
               insurance_fee_in_cents: 0,
               customs_fee_in_cents: 0,
               charge_fee_in_cents: 0,
               customs_id: 0,
            },
         ],
      },
   });

   const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "items",
   });

   useEffect(() => {
      setItemsCount(fields.length);
   }, [fields]);

   const handleAddItem = () => {
      // Simply add the number of items needed to reach the target count
      const itemsToAdd = items_count - fields.length;

      if (itemsToAdd > 0) {
         // Add only the additional items needed
         for (let i = 0; i < itemsToAdd; i++) {
            append({
               description: "",
               weight: undefined,
               rate_id: rate?.id || 0,
               cost_in_cents: rate?.cost_in_cents || 0,
               rate_in_cents: rate?.rate_in_cents || 0,
               rate_type: rate?.rate_type || "WEIGHT",
               insurance_fee_in_cents: 0,
               customs_fee_in_cents: 0,
               charge_fee_in_cents: 0,
               customs_id: 0,
            });
         }

         // Focus on the first newly added item
         setTimeout(() => {
            const newItemIndex = fields.length; // This will be the index of the first new item
            const input = document.querySelector<HTMLInputElement>(`input[name="items.${newItemIndex}.description"]`);
            input?.focus();
         }, 0);
      }
   };
   const handleRemoveAll = () => {
      // remove all items BUT the first one NOT THE FIRST ONE
      // Remove from the end to avoid index shifting issues
      for (let i = fields.length - 1; i > 0; i--) {
         remove(i);
      }
      setItemsCount(1);
   };

   const { mutate: createInvoice, isPending: isCreatingInvoice } = useInvoices.create({
      onSuccess: (data) => {
         form.reset();
         setSelectedCustomer(null);
         setSelectedReceiver(null);
         setSelectedService(null);
         toast.success("Orden creada correctamente");

         console.log(data, "invoice Created");
         navigate(`/orders/${data.id}`);
      },
      onError: (error) => {
         toast.error(error.response.data.message);
      },
   });

   const handleSubmit = (data: FormValues) => {
      data.service_id = selectedService?.id || 0;
      data.agency_id = user?.agency_id || 0;
      data.user_id = user?.id || "";
      data.customer_id = selectedCustomer?.id || 0;
      data.receiver_id = selectedReceiver?.id || 0;
      data.items = data.items.map((item) => ({
         ...item,
		  charge_fee_in_cents: dollarsToCents(item?.charge_fee_in_cents || 0),
		  insurance_fee_in_cents: dollarsToCents(item?.insurance_fee_in_cents || 0),
      }));
      console.log(data, "form DATA on submit");

      createInvoice(data);
   };

   const handleOpenDialog = (type: "insurance" | "charge" | "rate", index: number) => {
      console.log(type, index, "type and index");
      setDialogState({ type, index });
   };

   if (shipping_rates?.length === 0) {
      return (
         <Alert>
            <AlertTitle>No rates found</AlertTitle>
            <AlertDescription>Please add a rate</AlertDescription>
         </Alert>
      );
   }

   return (
      <>
         <Card>
            <form onSubmit={form.handleSubmit(handleSubmit as any)}>
               <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                     <h3>Items in Order</h3>
                     <div className="flex space-x-2 justify-end items-center">
                        <Input
                           className="w-18"
                           type="number"
                           min={1}
                           value={items_count === 0 ? "" : items_count}
                           onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                 setItemsCount(0); // Temporarily allow 0 to avoid breaking input
                              } else {
                                 const num = Number(val);
                                 if (!isNaN(num) && num >= 1) {
                                    setItemsCount(num);
                                 }
                              }
                           }}
                           onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                 e.preventDefault();
                                 handleAddItem();
                              }
                           }}
                        />

                        <Button onClick={handleAddItem} variant="ghost" type="button">
                           <PackagePlus />
                           <span className="hidden xl:block">Add Items</span>
                        </Button>
                        <Button onClick={handleRemoveAll} variant="ghost" type="button">
                           <Trash />
                           <span className="hidden xl:block">Delete All</span>
                        </Button>
                     </div>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <Table>
                     <TableCaption>A list of your recent invoices.</TableCaption>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-4">No.</TableHead>
                           <TableHead className="w-4">
                              <div className="flex items-center gap-2">
                                 <Scale className="w-4 h-4" />/<BoxIcon className="w-4 h-4" />{" "}
                              </div>
                           </TableHead>
                           <TableHead>Categoria</TableHead>
                           <TableHead>Description</TableHead>
                           <TableHead className="text-right w-20">Arancel</TableHead>
                           <TableHead className="text-right w-20">Peso</TableHead>
                           <TableHead className="text-right w-20">Rate</TableHead>
                           <TableHead className="text-right w-20">Subtotal</TableHead>
                           <TableHead className="w-10"></TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {fields.map((field, index) => (
                           <ItemRow
                              key={field.id}
                              index={index}
                              form={form}
                              remove={remove}
                              openDialog={handleOpenDialog}
                           />
                        ))}
                     </TableBody>
                  </Table>
               </CardContent>
               <InvoiceTotal form={form} />
               <div className="flex justify-end m-10">
                  <Button className="w-1/2 mt-4 mx-auto" type="submit" disabled={isCreatingInvoice}>
                     {isCreatingInvoice ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin" /> Facturando...
                        </>
                     ) : (
                        "Facturar"
                     )}
                  </Button>
               </div>
            </form>
            <InsuranceFeeDialog
               open={dialogState.type === "insurance"}
               setOpen={() => setDialogState({ type: "", index: 0 })}
               form={form}
               index={dialogState.index || 0}
            />
            <ChargeDialog
               open={dialogState.type === "charge"}
               setOpen={() => setDialogState({ type: "", index: 0 })}
               form={form}
               index={dialogState.index || 0}
            />
         </Card>
      </>
   );
}

function InvoiceTotal({ form }: { form: any }) {
   const [open, setOpen] = useState(false);
   const total_weight = form.watch("items").reduce((acc: number, item: any) => acc + item?.weight || 0, 0);
   return (
      <div>
         <div className="mt-8 flex justify-end p-2 lg:pr-6">
            <ul className="grid gap-3 w-full lg:w-1/4 ">
               <li className="flex items-center bg-foreground/5 p-2 rounded-md justify-between">
                  <span className="text-muted-foreground">Peso</span>
                  <span>{total_weight.toFixed(2)} lbs</span>
               </li>
               <Separator />
               <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${centsToDollars(form.getValues("total_in_cents")).toFixed(2) || 0.0}</span>
               </li>

               <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$0.00</span>
               </li>

               <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="text-muted-foreground">Discount</span>
                     <Button onClick={() => setOpen(true)} type="button" variant="ghost" size="icon" className="ml-2">
                        <PlusCircle />
                     </Button>
                  </div>
                  <span>$0.00</span>
               </li>
               <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span>$0.00</span>
               </li>
               <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Total</span>
                  <span>$0.00</span>
               </li>
            </ul>
         </div>

         <div className="flex justify-end m-10">
            <Separator />
         </div>
         <DiscountDialog open={open} setOpen={setOpen} form={form} />
      </div>
   );
}
