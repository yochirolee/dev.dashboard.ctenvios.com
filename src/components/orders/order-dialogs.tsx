import { useEffect, useState } from "react";
import {
   AlertDialog,
   AlertDialogCancel,
   AlertDialogAction,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "../ui/select";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";

export const InsuranceFeeDialog = ({
   open,
   setOpen,
   index,
   form,
   dispatch,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   index: number;
   form: any;
   dispatch?: React.Dispatch<any>;
}) => {
   const [insuranceValue, setInsuranceValue] = useState<string>("");

   useEffect(() => {
      if (open) {
         const currentValue = form.getValues(`items.${index}.insurance_fee_in_cents`);
         setInsuranceValue(currentValue ? centsToDollars(currentValue).toFixed(2) : "");
      }
   }, [open, form, index]);

   const handleInsurance = () => {
      const amountInCents = dollarsToCents(parseFloat(insuranceValue || "0"));

      if (dispatch) {
         // Use reducer dispatch if available
         dispatch({
            type: "SET_INSURANCE",
            payload: { amount: amountInCents },
         });
      } else {
         // Fallback to direct form update
         form.setValue(`items.${index}.insurance_fee_in_cents`, amountInCents);
      }
      setOpen(false);
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Agregar Seguro</AlertDialogTitle>
               <AlertDialogDescription>Agrega un seguro a este item.</AlertDialogDescription>
            </AlertDialogHeader>

            <Input
               type="number"
               autoComplete="off"
               className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
               value={insuranceValue}
               onChange={(e) => setInsuranceValue(e.target.value)}
               placeholder="Insurance fee"
            />

            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction onClick={() => handleInsurance()}>Agregar</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export const ChargeDialog = ({
   open,
   setOpen,
   index,
   form,
   dispatch,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   index: number;
   form: any;
   dispatch?: React.Dispatch<any>;
}) => {
   const [chargeValue, setChargeValue] = useState<string>("");

   useEffect(() => {
      if (open) {
         const currentValue = form.getValues(`items.${index}.charge_fee_in_cents`);
         setChargeValue(currentValue ? centsToDollars(currentValue).toFixed(2) : "");
      }
   }, [open, form, index]);

   const handleCharge = () => {
      const amountInCents = dollarsToCents(parseFloat(chargeValue || "0"));

      if (dispatch) {
         // Use reducer dispatch if available
         dispatch({
            type: "SET_CHARGE",
            payload: { amount: amountInCents },
         });
      } else {
         // Fallback to direct form update
         form.setValue(`items.${index}.charge_fee_in_cents`, amountInCents);
      }
      setOpen(false);
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Adicionar Cargo</AlertDialogTitle>
               <AlertDialogDescription>Adiciona un cargo a este item.</AlertDialogDescription>
            </AlertDialogHeader>

            <Input
               type="number"
               autoComplete="off"
               className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
               value={chargeValue}
               onChange={(e) => setChargeValue(e.target.value)}
               placeholder="0"
            />

            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction onClick={() => handleCharge()}>Adicionar</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export const ChangeRateDialog = ({
   open,
   setOpen,
   index,
   form,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   index: number;
   form: any;
}) => {
   const [rateValue, setRateValue] = useState<string>("");

   useEffect(() => {
      if (open) {
         const currentValue = form.getValues(`items.${index}.rate_in_cents`);
         setRateValue(currentValue ? centsToDollars(currentValue).toFixed(2) : "");
      }
   }, [open, form, index]);

   const handleChangeRate = () => {
      form.setValue(`items.${index}.rate_in_cents`, dollarsToCents(parseFloat(rateValue || "0")));
      setOpen(false);
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Cambiar Tarifa</AlertDialogTitle>
               <AlertDialogDescription>Cambia la tarifa de este item.</AlertDialogDescription>
            </AlertDialogHeader>

            <Input
               autoComplete="off"
               className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
               value={rateValue}
               type="number"
               onChange={(e) => setRateValue(e.target.value)}
               placeholder="Tarifa"
            />

            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction onClick={() => handleChangeRate()}>Cambiar</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

const discountOptions = [
   { label: "cash", value: "cash" },
   { label: "percent", value: "percent" },
   { label: "rate", value: "rate" },
];

export const DiscountDialog = ({
   open,
   setOpen,
   form,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   form: any;
}) => {
   const [discountType, setDiscountType] = useState<string>("");
   const [discountAmount, setDiscountAmount] = useState<string>("");

   useEffect(() => {
      if (open) {
         const currentValue = form.getValues(`discount_type`);
         setDiscountType(currentValue || "");
         const currentAmount = form.getValues(`discount_amount_in_cents`);
         setDiscountAmount(currentAmount ? centsToDollars(currentAmount).toFixed(2) : "");
      }
   }, [open, form]);

   const handleAddDiscount = () => {
      form.setValue(`discount_type`, discountType);
      form.setValue(`discount_amount_in_cents`, dollarsToCents(parseFloat(discountAmount || "0")));
      setOpen(false);
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Descuento</AlertDialogTitle>
               <AlertDialogDescription>Agrega un descuento a la factura.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
               <Select value={discountType} onValueChange={(value) => setDiscountType(value)}>
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="Tipo de Descuento" />
                  </SelectTrigger>
                  <SelectContent>
                     {discountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                           {option.label}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               <Input
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  type="number"
                  placeholder="Descuento"
               />
            </div>
            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction onClick={() => handleAddDiscount()}>Adicionar</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};
