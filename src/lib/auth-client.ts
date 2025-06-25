import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.API_URL,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	fetchOptions: {
		credentials: "include",
		baseURL: import.meta.env.VITE_AUTH_URL,
	},
});
