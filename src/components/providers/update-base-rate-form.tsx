import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { shippingRateSchema } from "@/data/types";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, PencilIcon, X } from "lucide-react";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import type { ShippingRate } from "@/data/types";
import { useAppStore } from "@/stores/app-store";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { DialogContent, Dialog, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";

export const UpdateBaseRateForm = ({
   rate,
   open,
   setOpen,
   providerId,
   setRate,
}: {
   rate: ShippingRate | null;
   open: boolean;
   setOpen: (open: boolean) => void;
   providerId: number | undefined;
   setRate: (rate: ShippingRate | null) => void;
}) => {
   if (!rate || !providerId) return null;
   const form = useForm<ShippingRate>({
      resolver: zodResolver(shippingRateSchema),
      defaultValues: {
         id: rate.id,
         name: rate.name,
         description: rate.description,
         rate_id: rate.id,
         agency_id: rate.agency_id || 0,
         rate_in_cents: centsToDollars(rate.rate_in_cents) || 0,
         cost_in_cents: centsToDollars(rate.cost_in_cents) || 0,
         rate_type: rate.rate_type || "WEIGHT",
         is_active: rate.is_active || true,
         min_weight: rate.min_weight || 0,
         max_weight: rate.max_weight || 0,
         is_base: true,
      },
   });
   //kkk
   const { mutate: updateRate, isPending } = useShippingRates.updateBaseRate(providerId || 0, {
      onSuccess: () => {
         form.reset();
         setOpen(false);
         setRate(null);
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });

   const onSubmit = (data: ShippingRate) => {
      data.rate_in_cents = dollarsToCents(data.rate_in_cents);
      data.cost_in_cents = dollarsToCents(data.cost_in_cents);
      updateRate({ data: data as unknown as ShippingRate });
   };

   const { user } = useAppStore();

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="outline">
               <PencilIcon className="w-4 h-4" />
               <span>Actualizar Tarifa</span>
            </Button>
         </DialogTrigger>

         <DialogContent>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Nombre</FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="Nombre" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Descripción</FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="Descripción" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="rate_type"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Tipo de Precio</FormLabel>
                           <div className="flex items-center gap-2">
                              <FormControl>
                                 <Switch
                                    checked={field.value === "FIXED"}
                                    onCheckedChange={(checked) => field.onChange(checked ? "FIXED" : "WEIGHT")}
                                 />
                              </FormControl>
                              <FormMessage />
                              <Badge variant="outline">{field.value === "FIXED" ? "Fijo" : "Por Peso"}</Badge>
                           </div>
                        </FormItem>
                     )}
                  />
                  <FormField
                     name="cost_in_cents"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Costo Agencia</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={user?.role !== "ROOT" && user?.role !== "ADMINISTRATOR"}
                                 type="number"
                                 {...field}
                                 onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue("cost_in_cents", parseFloat(e.target.value));
                                 }}
                                 placeholder="Costo"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="rate_in_cents"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Precio Venta</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 {...field}
                                 onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue("rate_in_cents", parseFloat(e.target.value));
                                 }}
                                 placeholder="Precio Costo"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="min_weight"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Peso Mínimo</FormLabel>
                           <FormControl>
                              <Input
                                 {...field}
                                 type="number"
                                 onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue("min_weight", parseFloat(e.target.value));
                                 }}
                                 placeholder="Peso Mínimo"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="max_weight"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Peso Máximo</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 {...field}
                                 onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue("max_weight", parseFloat(e.target.value));
                                 }}
                                 placeholder="Peso Máximo"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <div className="flex justify-end gap-2">
                     <Button type="submit" disabled={isPending}>
                        {isPending ? (
                           <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Actualizando...
                           </>
                        ) : (
                           "Actualizar Tarifa"
                        )}
                     </Button>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                           form.reset();
                           setOpen(false);
                        }}
                     >
                        <X className="w-4 h-4" />
                        Cerrar
                     </Button>
                  </div>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};
