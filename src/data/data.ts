import { Banknote, CreditCard, CreditCardIcon, Zap } from "lucide-react";
export const ROLE_HIERARCHY = {
   ROOT: 100,
   ADMINISTRATOR: 90,
   CARRIER_ADMIN: 80,
   AGENCY_ADMIN: 70,
   SALES: 60,
   CARRIER_MESSENGER: 50,
   MESSENGER: 40,
} as const;

export const roles = {
   ROOT: "ROOT",
   ADMINISTRATOR: "ADMINISTRATOR",
   AGENCY_ADMIN: "AGENCY_ADMIN",
   MESSENGER: "MESSENGER",
   SALES: "SALES",
   CARRIER_MESSENGER: "CARRIER_MESSENGER",
   CARRIER_ADMIN: "CARRIER_ADMIN",
} as const;

export const payment_methods = [
   {
      id: "CASH",
      title: "Cash",
      description: "Pay in cash 0% fee.",
      icon: Banknote,
   },
   {
      id: "CREDIT_CARD",
      title: "Credit Card",
      description: "Pay with credit card 3% fee.",
      icon: CreditCard,
   },
   {
      id: "DEBIT_CARD",
      title: "Debit Card",
      description: "Pay with debit card 3% fee.",
      icon: CreditCard,
   },
   {
      id: "ZELLE",
      title: "Zelle",
      description: "Pay with Zelle 0% fee.",
      icon: Zap,
   },
   {
      id: "OTHER",
      title: "Other",
      description: "Pay with other method 0% fee.",
      icon: CreditCardIcon,
   },
];
