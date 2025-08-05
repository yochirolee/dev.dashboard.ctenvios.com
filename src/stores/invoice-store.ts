import { create } from "zustand";
import { type Customer, type Receiver, type Item, type Rate, type Service } from "@/data/types";


interface InvoiceStore {
	selectedCustomer: Customer | null;
	selectedReceiver: Receiver | null;
	selectedService: Service | null;

	items: Item[];
	selectedRate: Rate | null;
	setSelectedCustomer: (selectedCustomer: Customer | null) => void;
	setSelectedReceiver: (selectedReceiver: Receiver | null) => void;
	setSelectedService: (selectedService: Service | null) => void;
	setSelectedRate: (selectedRate: Rate | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
	selectedCustomer: null,
	selectedReceiver: null,
	selectedService: null,
	selectedRate: null,
	setSelectedRate: (selectedRate: Rate | null) => set({ selectedRate }),
	items: [],
	setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
	setSelectedReceiver: (selectedReceiver: Receiver | null) => {
		set({ selectedReceiver });
	},
	setSelectedService: (selectedService: Service | null) => {
		set({ selectedService });
	},

	
}));
