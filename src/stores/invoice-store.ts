import { create } from "zustand";
import { type Customer, type Receiver, type Service, type ShippingRate, type Provider } from "@/data/types";

interface ServiceWithRates extends Service {
   shipping_rates: ShippingRate[];
   provider: Provider;
}

interface InvoiceStore {
   selectedCustomer: Customer | null;
   selectedReceiver: Receiver | null;
   selectedService: ServiceWithRates | null;

   selectedRate: ShippingRate | null;
   shipping_rates: ShippingRate[];

   setSelectedCustomer: (selectedCustomer: Customer | null) => void;
   setSelectedReceiver: (selectedReceiver: Receiver | null) => void;
   setSelectedService: (selectedService: ServiceWithRates | null) => void;
   setSelectedRate: (selectedRate: ShippingRate | null) => void;
   setShippingRates: (shipping_rates: ShippingRate[]) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
   selectedCustomer: null,
   selectedReceiver: null,
   selectedService: null,
   selectedRate: null,
   shipping_rates: [] as ShippingRate[],
   setShippingRates: (shipping_rates: ShippingRate[]) => set({ shipping_rates }),
   setSelectedRate: (selectedRate: ShippingRate | null) => set({ selectedRate }),

   setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
   setSelectedReceiver: (selectedReceiver: Receiver | null) => {
      set({ selectedReceiver });
   },
   setSelectedService: (selectedService: ServiceWithRates | null) => {
      set({ selectedService });
      set({ shipping_rates: selectedService?.shipping_rates || [] });
   },
}));
