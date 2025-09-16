import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
	session: any;
	setSession: (session: any) => void;
	clearSession: () => void;
}

export const useAppStore = create<AppStore>()(
	persist(
		(set) => ({
			session: null,
			setSession: (session) => set({ session }),
			clearSession: () => set({ session: null }),
		}),
		{
			name: "app-store",
		},
	),
);
