import type { User } from "@/data/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
	session: any;
	setSession: (session: any) => void;
	user: User | null;
	setUser: (user: User | null) => void;
	clearAll: () => void;
	
}

export const useAppStore = create<AppStore>()(
	persist(
		(set) => ({
			session: null,
			setSession: (session) => set({ session }),
			user: null,
			setUser: (user) => set({ user }),
			
			clearAll: () => set({ session: null, user: null }),
		}),
		{
			name: "app-store",
		},
	),
);
