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
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
	selectedCustomer: null,
	selectedReceipt: null,
	selectedService: null,
	selectedRate: null,

	items: [],
	setSelectedCustomer: (selectedCustomer: Customer | null) => set({ selectedCustomer }),
	setSelectedReceipt: (selectedReceipt: Receipt | null) => {
		set({ selectedReceipt });
	},
	setSelectedService: (selectedService: Service | null) => {
		set({ selectedService });
		set({
			selectedRate:
				selectedService?.rates.find((rate) => rate.service_id === selectedService?.id) || null,
		});
	},

	/* setTotalAmount: (total_amount: number) => set({ total_amount }),
	addItem: (item: Item) => set((state) => ({ items: [...state.items, item] })),
	updateItem: (index: number, updates: Partial<Item>) =>
		set((state) => {
			console.log(index, "index", updates, "updates");
			const updatedItems = state.items.map((item, i) => {
				if (i === index) {
					const updatedItem = { ...item, ...updates };
					// Recalculate subtotal when weight changes
					const weight = updatedItem.weight || 0;
					const custom_fee = updatedItem.custom_fee || 0;
					const price = state.selectedRate?.public_price || 0;
					const subtotal = parseFloat((weight * price + custom_fee).toFixed(2));
					return { ...updatedItem, subtotal };
				}
				return item;
			});
			return { items: updatedItems };
		}),
	removeItem: (id: number) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
	clearItems: () => set({ items: [] }), */
}));
