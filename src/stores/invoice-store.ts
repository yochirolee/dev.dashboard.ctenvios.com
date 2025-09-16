import { create } from "zustand";
import { type Customer, type Receiver, type Item, type Service } from "@/data/types";

interface UiRate {
	id: number;
	name: string;
	rate_in_cents: number;
	rate_type: "WEIGHT" | "FIXED";
	product_id: number | null;
	min_weight: number | null;
	max_weight: number | null;
	product_name: string | null;
	
}


interface InvoiceStore {
	selectedCustomer: Customer | null;
	selectedReceiver: Receiver | null;
	selectedService: Service | null;

	items: Item[];
	selectedRate: UiRate | null;
	setSelectedCustomer: (selectedCustomer: Customer | null) => void;
	setSelectedReceiver: (selectedReceiver: Receiver | null) => void;
	setSelectedService: (selectedService: Service | null) => void;
	setSelectedRate: (selectedRate: UiRate | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
	selectedCustomer: null,
	selectedReceiver: null,
	selectedService: null,
	selectedRate: null,
	setSelectedRate: (selectedRate: UiRate | null) => set({ selectedRate }),
	items: [],
	setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
	setSelectedReceiver: (selectedReceiver: Receiver | null) => {
		set({ selectedReceiver });
	},
	setSelectedService: (selectedService: Service | null) => {
		set({ selectedService });
	},

	
}));
