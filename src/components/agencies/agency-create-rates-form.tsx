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
   name: z.string().min(1, { message: "El nombre es requerido" }),
   description: z.string().optional(),
   buyer_agency_id: z.number(),
   seller_agency_id: z.number(),
   service_id: z.number(),
   price_in_cents: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
   cost_in_cents: z.number().min(0, { message: "El precio de costo debe ser mayor a 0" }),
   is_active: z.boolean(),
   unit: z.enum(["PER_LB", "FIXED"]),
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
   const { mutate: createRate, isPending } = useShippingRates.create(buyer_agency_id);

   const user = useAppStore();
   const seller_agency_id = user?.user?.agency_id;
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         product_id: 0,
         name: "",
         description: "",
         service_id: service_id,
         buyer_agency_id: buyer_agency_id,
         seller_agency_id: seller_agency_id,
         price_in_cents: undefined,
         cost_in_cents: undefined,
         is_active: true,
         unit: "PER_LB",
         min_weight: undefined,
         max_weight: undefined,
      },
   });

   const selectedProduct = products?.find((product: Product) => product.id === form.watch("product_id"));
   form.setValue("name", selectedProduct?.name ?? "");

   function onSubmit(data: z.infer<typeof formSchema>) {
      console.log(data);
      createRate(
         {
            ...data,
            price_in_cents: dollarsToCents(data.price_in_cents),
            cost_in_cents: dollarsToCents(data.cost_in_cents),
            description: data.description ?? "",
         } as ShippingRate,
         {
            onSuccess: () => {
               toast.success("Tarifa creada correctamente");
               form.reset();
               setIsOpen(false);
            },
            onError: (error) => {
               toast.error(error.message);
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
            <Controller
               name="name"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="form-create-rate-name">Nombre</FieldLabel>
                     <Input type="text" {...field} placeholder="Nombre" />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />
            <Controller
               name="description"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="form-create-rate-description">Descripción</FieldLabel>
                     <Input type="text" {...field} placeholder="Descripción" />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                           placeholder="Precio en Cents"
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
                           placeholder="Precio en Cents"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
            </Field>
            <Field orientation="horizontal">
               <Controller
                  name="unit"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-rate-unit">Unidad</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange} aria-invalid={fieldState.invalid}>
                           <SelectTrigger>
                              <SelectValue placeholder="Selecciona una unidad" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="PER_LB">Por libra</SelectItem>
                              <SelectItem value="FIXED">Fijo</SelectItem>
                           </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </Field>
                  )}
               />
               <Controller
                  name="is_active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field orientation="horizontal" data-invalid={fieldState.invalid} className="w-full">
                        <FieldContent>
                           <FieldLabel htmlFor="form-create-rate-is_active">Activo</FieldLabel>
                           <FieldDescription>La tarifa sera activa por defecto</FieldDescription>
                           <Switch
                              id="form-create-rate-is_active"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                           />
                        </FieldContent>
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
                     <Spinner className="w-4 h-4 animate-spin" /> <span>Creando tarifa...</span>
                  </>
               ) : (
                  "Crear tarifa"
               )}
            </Button>
         </FieldGroup>
      </form>
   );
};
