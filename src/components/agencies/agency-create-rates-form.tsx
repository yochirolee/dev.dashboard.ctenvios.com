import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldContent } from "../ui/field";
import { Input } from "../ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProducts } from "@/hooks/use-products";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from "../ui/select";
import type { Product, ShippingRate } from "@/data/types";
import { Switch } from "../ui/switch";
import { useAppStore } from "@/stores/app-store";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { Spinner } from "../ui/spinner";
import { dollarsToCents } from "@/lib/cents-utils";

const formSchema = z.object({
   product_id: z.number().min(1, { message: "El producto es requerido" }),
   buyer_agency_id: z.number(),
   seller_agency_id: z.number(),
   service_id: z.number(),
   price_in_cents: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
   cost_in_cents: z.number().min(0, { message: "El precio de costo debe ser mayor a 0" }),
   is_active: z.boolean(),

   min_weight: z.number().optional(),
   max_weight: z.number().optional(),
});

export const AgencyCreateRatesForm = ({
   service_id,
   buyer_agency_id,
   setIsOpen,
}: {
   service_id: number;
   buyer_agency_id: number;
   setIsOpen: (isOpen: boolean) => void;
}) => {
   const { data: products } = useProducts.get();
   const { mutate: createRate, isPending } = useShippingRates.create(service_id, buyer_agency_id);

   const user = useAppStore();
   const seller_agency_id = user?.agency?.id;

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         product_id: 0,
         service_id: service_id,
         buyer_agency_id: buyer_agency_id,
         seller_agency_id: seller_agency_id,
         price_in_cents: undefined,
         cost_in_cents: undefined,
         is_active: true,
         min_weight: undefined,
         max_weight: undefined,
      },
   });

   console.log(form.formState.errors);

   function onSubmit(data: z.infer<typeof formSchema>) {
      console.log(data);
      createRate(
         {
            ...data,
            price_in_cents: dollarsToCents(data.price_in_cents),
            cost_in_cents: dollarsToCents(data.cost_in_cents),
         } as ShippingRate,
         {
            onSuccess: () => {
               toast.success("Tarifa creada correctamente");
               form.reset();
               setIsOpen(false);
            },
            onError: (error) => {
            
               const errorMessage =
                  (error as any)?.response?.data?.error ||
                  (error as any)?.response?.data?.message ||
                  "Error al crear la tarifa";
               toast.error(errorMessage);
            },
         }
      );
      /*       toast("You submitted the following values:", {
         description: (
            <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
               <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
         ),
         position: "bottom-right",
         classNames: {
            content: "flex flex-col gap-2",
         },
         style: {
            "--border-radius": "calc(var(--radius)  + 4px)",
         } as React.CSSProperties,
      }); */
   }
   return (
      <form id="form-create-rate" onSubmit={form.handleSubmit(onSubmit)}>
         <FieldGroup>
            <Controller
               name="product_id"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="form-create-rate-product_id">Producto</FieldLabel>
                     <Select
                        value={field.value?.toString() ?? ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                        aria-invalid={fieldState.invalid}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                           {products?.map((product: Product) => (
                              <SelectItem key={product.id} value={product.id?.toString() ?? ""}>
                                 {product.name}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </Field>
               )}
            />

            <Field orientation="horizontal">
               <Controller
                  name="cost_in_cents"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-rate-cost_in_cents">Precio de Costo</FieldLabel>
                        <Input
                           type="number"
                           step="0.01"
                           value={field.value || ""}
                           onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                           onBlur={field.onBlur}
                           name={field.name}
                           placeholder="Precio de Costo"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  name="price_in_cents"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-rate-price_in_cents">Precio de Venta</FieldLabel>
                        <Input
                           type="number"
                           step="0.01"
                           value={field.value || ""}
                           onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                           onBlur={field.onBlur}
                           name={field.name}
                           placeholder="Precio de Venta"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </Field>
            <Field orientation="horizontal">
               <Controller
                  name="is_active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <FieldContent>
                           <FieldLabel htmlFor="form-create-rate-is_active">Activo</FieldLabel>
                           <FieldDescription>La tarifa sera activa por defecto</FieldDescription>
                        </FieldContent>{" "}
                        <Switch
                           className="mt-4"
                           id="form-create-rate-is_active"
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </Field>
                  )}
               />
            </Field>
            <Field orientation="horizontal">
               <Controller
                  name="min_weight"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-rate-min_weight">Peso minimo</FieldLabel>
                        <Input
                           type="number"
                           step="0.01"
                           value={field.value ?? ""}
                           onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                           onBlur={field.onBlur}
                           name={field.name}
                           placeholder="Peso minimo"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  name="max_weight"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-rate-max_weight">Peso maximo</FieldLabel>
                        <Input
                           type="number"
                           step="0.01"
                           value={field.value ?? ""}
                           onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                           onBlur={field.onBlur}
                           name={field.name}
                           placeholder="Peso maximo"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </Field>

            <Button type="submit" form="form-create-rate">
               {isPending ? (
                  <>
                     <Spinner className="w-4 h-4 animate-spin" /> <span className="hidden md:block">Creando tarifa...</span>
                  </>
               ) : (
                  "Crear tarifa"
               )}
            </Button>
         </FieldGroup>
      </form>
   );
};
