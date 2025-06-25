import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "better-auth/types";
import { authClient } from "@/lib/auth-client";

interface RegisterUserData {
	email: string;
	password: string;
	name: string;
	agency_id: number;
	role: string;
}

export const useGetUsers = () => {
	return useQuery({
		queryKey: ["getUsers"],
		queryFn: api.users.get,
	});
};

export const useRegister = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userData: RegisterUserData) =>
			authClient.signUp.email({
				email: userData.email,
				password: userData.password,
				name: userData.name,
				role: userData.role,
				agency_id: parseInt(userData.agency_id),
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
		onError: (error) => {
			toast.error("El usuario no ha sido registrado correctamente");
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { userId: string; user: Partial<User> }) =>
			api.users.update(params.userId, params.user),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["getUsers"] });
		},
	});
};

export const useLogin = () => {
	return useMutation({
		mutationFn: (params: { email: string; password: string }) => api.users.login(params),

		onError: (error) => {
			console.error("Login failed:", error);
		},
	});
};
