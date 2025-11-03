import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldContent } from "../ui/field";
import { Input } from "../ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShippingRate } from "@/data/types";
import { Switch } from "../ui/switch";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { Spinner } from "../ui/spinner";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";

const formSchema = z.object({
   price_in_cents: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
   cost_in_cents: z.number().min(0, { message: "El precio de costo debe ser mayor a 0" }),
   is_active: z.boolean(),
});

export const AgencyUpdateRatesForm = ({
   setIsOpen,
   rate,
}: {
   rate: ShippingRate;
   setIsOpen: (isOpen: boolean) => void;
}) => {
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         is_active: rate?.is_active || true,
         cost_in_cents: centsToDollars(rate?.cost_in_cents || 0),
         price_in_cents: centsToDollars(rate?.price_in_cents || 0),
      },
   });
   const { mutate: updateRate, isPending } = useShippingRates.update(rate?.id as number);

   function onSubmit(data: z.infer<typeof formSchema>) {
      console.log(data);
      updateRate(
         {
            ...rate,
            price_in_cents: dollarsToCents(data.price_in_cents),
            cost_in_cents: dollarsToCents(data.cost_in_cents),
         } as ShippingRate,
         {
            onSuccess: () => {
               toast.success("Tarifa actualizada correctamente");
               setIsOpen(false);
               form.reset();
            },
            onError: (error) => {
               const errorMessage =
                  (error as any)?.response?.data?.error ||
                  (error as any)?.response?.data?.message ||
                  "Error al actualizar la tarifa";
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
      <form id="form-update-rate" onSubmit={form.handleSubmit(onSubmit)}>
         <FieldGroup>
            <Field orientation="horizontal">
               <Controller
                  name="cost_in_cents"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-update-rate-cost_in_cents">Precio de Costo</FieldLabel>
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
                        <FieldLabel htmlFor="form-update-rate-price_in_cents">Precio de Venta</FieldLabel>
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

            <Button type="submit" form="form-update-rate">
               {isPending ? (
                  <>
                     <Spinner className="w-4 h-4 animate-spin" /> <span className="hidden md:block">Actualizando tarifa...</span>
                  </>
               ) : (
                  "Actualizar tarifa"
               )}
            </Button>
         </FieldGroup>
      </form>
   );
};
