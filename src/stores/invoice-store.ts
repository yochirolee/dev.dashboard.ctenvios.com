import { create } from "zustand";
import { type Customer, type Receipt, type Item, type Rate } from "@/data/types";

interface Service {
	id: number;
	name: string;
	description: string;
	service_type: string;
	rates: Rate[];
}

interface InvoiceStore {
	selectedCustomer: Customer | null;
	selectedReceipt: Receipt | null;
	selectedService: Service | null;

	items: Item[];
	selectedRate: Rate | null;
	setSelectedCustomer: (selectedCustomer: Customer | null) => void;
	setSelectedReceipt: (selectedReceipt: Receipt | null) => void;
	setSelectedService: (selectedService: Service | null) => void;
	setSelectedRate: (selectedRate: Rate | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
	selectedCustomer: null,
	selectedReceipt: null,
	selectedService: null,
	selectedRate: null,
	setSelectedRate: (selectedRate: Rate | null) => set({ selectedRate }),
	items: [],
	setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
	setSelectedReceipt: (selectedReceipt: Receipt | null) => {
		set({ selectedReceipt });
	},
	setSelectedService: (selectedService: Service | null) => {
		set({ selectedService });
	},

	
}));
