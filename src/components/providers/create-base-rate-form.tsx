import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { shippingRateSchema } from "@/data/types";

import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { Loader2, Plus, X } from "lucide-react";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import type { ShippingRate } from "@/data/types";
import { useAppStore } from "@/stores/app-store";
import { dollarsToCents } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { DialogContent, DialogTrigger, Dialog, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

export const CreateBaseRateForm = ({
   open,
   setOpen,
   serviceId,
   providerId,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   serviceId: number | undefined;
   providerId: number | undefined;
}) => {
   if (!serviceId) return null;

   const form = useForm<ShippingRate>({
      resolver: zodResolver(shippingRateSchema),

      defaultValues: {
         name: "",
         description: "",
         agency_id: 0,
         rate_in_cents: 0,
         cost_in_cents: 0,
         service_id: serviceId,
         rate_type: "WEIGHT",
         is_active: true,
         min_weight: 0,
         max_weight: 0,
         is_base: true,
      },
   });
   //kkk
   const { mutate: createRate, isPending } = useShippingRates.createBaseRate(providerId || 0, {
      onSuccess: () => {
         form.reset();
         setOpen(false);
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });

   console.log(form.formState.errors);
   const onSubmit = (data: ShippingRate) => {
      data.rate_in_cents = dollarsToCents(data.rate_in_cents);
      data.cost_in_cents = dollarsToCents(data.cost_in_cents);
      createRate(data);
   };

   const { user } = useAppStore();

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="ghost">
               <Plus className="w-4 h-4" />
               <span>Crear Tarifa</span>
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Crear Tarifa</DialogTitle>
               <DialogDescription>Agrega una tarifa para el servicio</DialogDescription>
            </DialogHeader>
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
                              Creando...
                           </>
                        ) : (
                           "Crear Tarifa"
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
