import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";
import type { User } from "@/data/types";
import { useNavigate } from "react-router-dom";

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
		mutationFn: (userData: User) => api.users.create(userData),
		onSuccess: (_, userData) => {
			queryClient.invalidateQueries({ queryKey: ["get-agency-users", userData.agency_id] });
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
			localStorage.setItem("authToken", session.session.token);
			useAppStore.setState({ session: session });
		},
	});
};

export const useLogOut = () => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: () => api.users.signOut(),
		onSuccess: () => {
			useAppStore.setState({ session: null });
			localStorage.removeItem("authToken");
			navigate("/login", { replace: true });
		},
	});
};
