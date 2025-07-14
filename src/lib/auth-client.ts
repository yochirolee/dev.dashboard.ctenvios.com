import { createAuthClient } from "better-auth/react";

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
		headers: {
			"Access-Control-Allow-Origin": "http://localhost:5173",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",
		},
	},
});
