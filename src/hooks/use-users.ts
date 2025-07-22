import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/stores/app-store";

interface RegisterUserData {
	email: string;
	password: string;
	name: string;
	agency_id: number;
	role: string;
}

export const useGetUsers = (page: number | 1, limit: number | 25) => {
	return useQuery({
		queryKey: ["getUsers", page, limit],
		queryFn: () => api.users.get(page, limit),
	});
};

export const useGetSession = () => {
	return useQuery({
		queryKey: ["getSession"],
		queryFn: () => api.users.getSession(),
		staleTime: 0,
	});
};

export const useRegister = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userData: RegisterUserData) =>
			(authClient.signUp.email as any)({
				email: userData.email,
				password: userData.password,
				name: userData.name,
				role: userData.role as "ROOT" | "ADMINISTRATOR" | "AGENCY_ADMIN" | "AGENCY_SALES",
				agency_id: userData.agency_id,
				image: "",
				callbackURL: "",
				fetchOptions: {
					cache: "no-store",
					credentials: "include",
				},
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["getUsers"] });
			toast.success("Usuario registrado correctamente");
		},
		onError: () => {
			toast.error("El usuario no ha sido registrado correctamente");
		},
	});
};

export const useLoginMutation = () => {
	return useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const session = await api.users.signIn(email, password);
			return session;
		},
		onSuccess: (session) => {
			console.log(session.session.token, "session on login mutation");
			localStorage.setItem("authToken", session.session.token);
			useAppStore.setState({ session: session });
			
		},
	});
};
