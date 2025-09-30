import { create } from "zustand";
import { type Customer, type Receiver, type Item, type Service, type ShippingRate } from "@/data/types";



 interface ServiceWithRates extends Service {
	shipping_rates: ShippingRate[];
}


interface InvoiceStore {
	selectedCustomer: Customer | null;
	selectedReceiver: Receiver | null;
	selectedService: ServiceWithRates | null;

	items: Item[];
	selectedRate: ShippingRate | null;
	setSelectedCustomer: (selectedCustomer: Customer | null) => void;
	setSelectedReceiver: (selectedReceiver: Receiver | null) => void;
	setSelectedService: (selectedService: ServiceWithRates | null) => void;
	setSelectedRate: (selectedRate: ShippingRate | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
	selectedCustomer: null,
	selectedReceiver: null,
	selectedService: null,
	selectedRate: null,
	setSelectedRate: (selectedRate: ShippingRate | null) => set({ selectedRate }),
	items: [],
	setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
	setSelectedReceiver: (selectedReceiver: Receiver | null) => {
		set({ selectedReceiver });
	},
	setSelectedService: (selectedService: ServiceWithRates | null) => {
		set({ selectedService });
	},

	
}));
