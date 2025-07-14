/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Extend better-auth types
declare module "better-auth/react" {
	interface AuthClient {
		signUp: {
			email: (options: {
				email: string;
				password: string;
				name: string;
				role?: "ROOT" | "ADMINISTRATOR" | "AGENCY_ADMIN" | "AGENCY_SALES";
				agency_id?: number;
				image?: string;
				callbackURL?: string;
				fetchOptions?: any;
			}) => Promise<any>;
		};
	}
}
