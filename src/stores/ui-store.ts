import { create } from "zustand";

interface UIStore {
	customerFormDialogOpen: boolean;
	receiptFormDialogOpen: boolean;
	serviceFormDialogOpen: boolean;
	setCustomerFormDialogOpen: (customerFormDialogOpen: boolean) => void;
	setReceiptFormDialogOpen: (receiptFormDialogOpen: boolean) => void;
	setServiceFormDialogOpen: (serviceFormDialogOpen: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	customerFormDialogOpen: false,
	receiptFormDialogOpen: false,
	serviceFormDialogOpen: false,
	setCustomerFormDialogOpen: (customerFormDialogOpen) => set({ customerFormDialogOpen }),
	setReceiptFormDialogOpen: (receiptFormDialogOpen) => set({ receiptFormDialogOpen }),
	setServiceFormDialogOpen: (serviceFormDialogOpen) => set({ serviceFormDialogOpen }),
}));
