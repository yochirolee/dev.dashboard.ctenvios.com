import { createAuthClient } from "better-auth/react";

const token = localStorage.getItem("authToken");
console.log(token, "token");

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:3000",

	fetchOptions: {
		auth: {
			type: "Bearer",
			token: () => token || "",
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},

		/* headers: {
			"Access-Control-Allow-Origin": "http://localhost:5173",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",
		}, */
	},
});
