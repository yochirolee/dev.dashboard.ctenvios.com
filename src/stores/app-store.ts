import { useRates } from "@/hooks/use-rates";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
	rates: any;
	setRates: (rates: any) => void;
	fetchRates: () => void;
	session: any;
	setSession: (session: any) => void;
	clearSession: () => void;
}

export const useAppStore = create<AppStore>()(
	persist(
		(set) => ({
			rates: null,
			setRates: (rates) => set({ rates }),

			session: null,
			setSession: (session) => set({ session }),
			clearSession: () => set({ session: null }),
			fetchRates: () => {
				const { data: rates } = useRates.getByAgencyId(
					useAppStore.getState().session.user.agency_id,
				);
				set({ rates });
			},
		}),
		{
			name: "app-store",
		},
	),
);
