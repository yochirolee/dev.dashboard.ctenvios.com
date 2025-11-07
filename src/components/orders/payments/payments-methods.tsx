
import {
   Field,
   FieldContent,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
   FieldLegend,
   FieldSet,
   FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller } from "react-hook-form";
import { Banknote, Zap } from "lucide-react";
import { CreditCard, CreditCardIcon } from "lucide-react";
import { ItemMedia } from "@/components/ui/item";
const payment_methods = [
   {
      id: "CASH",
      title: "Cash",
      description: "Pay in cash 0% fee.",
      icon: <Banknote className="size-4" />,
   },
   {
      id: "CREDIT_CARD",
      title: "Credit Card",
      description: "Pay with credit card 3% fee.",
      icon: <CreditCard className="size-4" />,
   },
   {
      id: "DEBIT_CARD",
      title: "Debit Card",
      description: "Pay with debit card 3% fee.",
      icon: <CreditCard className="size-4" />,
   },
   {
      id: "ZELLE",
      title: "Zelle",
      description: "Pay with Zelle 0% fee.",
      icon: <Zap className="size-4" />,
   },
   {
      id: "OTHER",
      title: "Other",
      description: "Pay with other method 0% fee.",
      icon: <CreditCardIcon className="size-4" />,
   },
] as const;

export function PaymentsMethods({ form }: { form: any }) {
   return (
      <FieldGroup>
         <Controller
            name="method"
            control={form.control}
            render={({ field, fieldState }) => (
               <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend>Payment Method</FieldLegend>
                  <FieldDescription>Select the payment method you want to use.</FieldDescription>
                  <RadioGroup
                     name={field.name}
                     value={field.value}
                     onValueChange={field.onChange}
                     aria-invalid={fieldState.invalid}
                     className="grid grid-cols-1 md:grid-cols-3 gap-2"
                  >
                     {payment_methods.map((method) => (
                        <FieldLabel key={method.id} htmlFor={`form-rhf-radiogroup-${method.id}`}>
                           <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                              <ItemMedia variant="icon">{method.icon}</ItemMedia>
                              <FieldContent className="flex flex-col gap-2">
                                 <FieldTitle>{method.title}</FieldTitle>

                                 <FieldDescription className="text-muted-foreground text-xs font-light">{method.description}</FieldDescription>
                              </FieldContent>
                              <RadioGroupItem
                                 value={method.id}
                                 id={`form-rhf-radiogroup-${method.id}`}
                                 aria-invalid={fieldState.invalid}
                              />
                           </Field>
                        </FieldLabel>
                     ))}
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
               </FieldSet>
            )}
         />
      </FieldGroup>
   );
}
