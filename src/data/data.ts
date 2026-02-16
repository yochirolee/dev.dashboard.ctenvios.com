import { Banknote, CreditCard, CreditCardIcon, Zap } from "lucide-react";
// Re-export roles and hierarchy from rbac.ts for backward compatibility
export { ROLES as roles, ROLE_HIERARCHY, ROLE_GROUPS } from "@/lib/rbac";
export type { Role } from "@/lib/rbac";

export const payment_methods = [
   { id: "CASH", title: "Cash", description: "Pay in cash 0% fee.", icon: Banknote },
   { id: "CHECK", title: "Check", description: "Pay by check 0% fee.", icon: Banknote },
   { id: "ZELLE", title: "Zelle", description: "Pay with Zelle 0% fee.", icon: Zap },
   { id: "CREDIT_CARD", title: "Credit Card", description: "Pay with credit card 3% fee.", icon: CreditCard },
   { id: "DEBIT_CARD", title: "Debit Card", description: "Pay with debit card 3% fee.", icon: CreditCard },
   { id: "BANK_TRANSFER", title: "Bank Transfer", description: "Pay by bank transfer 0% fee.", icon: Banknote },
   { id: "PAYPAL", title: "PayPal", description: "Pay with PayPal 0% fee.", icon: CreditCardIcon },
   { id: "OTHER", title: "Other", description: "Pay with other method 0% fee.", icon: CreditCardIcon },
];
