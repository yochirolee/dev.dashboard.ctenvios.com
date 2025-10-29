import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productSchema, type Product } from "@/data/types";
import { Switch } from "../../ui/switch";
import { Spinner } from "../../ui/spinner";
import { useProducts } from "@/hooks/use-products";
//Create Product Form Schema
const formSchema = productSchema;
type FormValues = z.input<typeof formSchema>;

export function CreateProductForm({
   serviceId,
   providerId,
   setOpen,
}: {
   serviceId: number;
   providerId: number;
   setOpen: (open: boolean) => void;
}) {
   const createProductMutation = useProducts.create();

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
         service_id: serviceId,
         provider_id: providerId,
         description: "",
         unit: "PER_LB" as const,
         type: "SHIPPING" as const,
         is_active: true,
      },
   });
   console.log(form.formState.errors);

   function onSubmit(data: FormValues) {
      createProductMutation.mutate(data as Product, {
         onSuccess: () => {
            toast.success("Producto creado correctamente");
            form.reset();
            setOpen(false);
         },
         onError: (error) => {
            toast.error((error as any).response.data.message);
            form.setError("root.serverError", { message: (error as any).response.data.message });
         },
      });
   }

   return (
      <form id="form-create-product" onSubmit={form.handleSubmit(onSubmit)}>
         <FieldGroup>
            <Controller
               name="name"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="form-create-product-name">Nombre del producto</FieldLabel>
                     <Input
                        {...field}
                        id="form-create-product-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nombre del producto"
                        autoComplete="off"
                     />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />
            <Controller
               name="description"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="form-create-product-description">Descripción</FieldLabel>
                     <Input
                        {...field}
                        id="form-create-product-description"
                        aria-invalid={fieldState.invalid}
                        placeholder="Descripción del producto"
                        autoComplete="off"
                     />
                     {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
               )}
            />

            <Field orientation="horizontal">
               <Controller
                  name="unit"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     //is a select with the options PER_LB and FIXED
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-product-unit">Unidad</FieldLabel>
                        <Select
                           {...field}
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           aria-invalid={fieldState.invalid}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Selecciona una unidad" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="PER_LB">Por libra</SelectItem>
                              <SelectItem value="FIXED">Fijo</SelectItem>
                           </SelectContent>
                        </Select>
                     </Field>
                  )}
               />
               <Controller
                  name="type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-create-product-type">Tipo</FieldLabel>
                        <Select
                           {...field}
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           aria-invalid={fieldState.invalid}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="SHIPPING">Envío</SelectItem>
                              <SelectItem value="CUSTOMS">Aduana</SelectItem>
                              <SelectItem value="DELIVERY">Entrega</SelectItem>
                           </SelectContent>
                        </Select>
                     </Field>
                  )}
               />
            </Field>

            <Controller
               name="is_active"
               control={form.control}
               render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                     <FieldContent>
                        <FieldLabel htmlFor="form-create-product-is-active">Activo</FieldLabel>
                        <FieldDescription>El producto estara activo por defecto</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                     </FieldContent>
                     <Switch
                        id="form-create-product-is-active"
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                     />
                  </Field>
               )}
            />
         </FieldGroup>

         <Field orientation="responsive" className="mt-6">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
               Reset
            </Button>
            <Button
               type="submit"
               form="form-create-product"
               disabled={form.formState.isSubmitting || createProductMutation.isPending}
            >
               {form.formState.isSubmitting || createProductMutation.isPending ? (
                  <>
                     <Spinner />
                     <span>Creando producto...</span>
                  </>
               ) : (
                  "Guardar"
               )}
            </Button>
         </Field>
      </form>
   );
}
