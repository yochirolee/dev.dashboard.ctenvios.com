import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:3000",
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	fetchOptions: {
		credentials: "include",
	},
});
