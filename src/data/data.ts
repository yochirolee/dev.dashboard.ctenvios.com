export const ROLE_HIERARCHY = {
	ROOT: 100,
	ADMINISTRATOR: 90,
	CARRIER_ADMIN: 80,
	AGENCY_ADMIN: 70,
	SALES: 60,
	CARRIER_MESSENGER: 50,
	MESSENGER: 40,
} as const;

export const roles = {
	ROOT: "ROOT",
	ADMINISTRATOR: "ADMINISTRATOR",
	AGENCY_ADMIN: "AGENCY_ADMIN",
	MESSENGER: "MESSENGER",
	SALES: "SALES",
	CARRIER_MESSENGER: "CARRIER_MESSENGER",
	CARRIER_ADMIN: "CARRIER_ADMIN",
} as const;

export const payment_methods = [
	{
		value: "CASH",
		label: "Efectivo",
	},
	{
		value: "CREDIT_CARD",
		label: "Tarjeta de crédito",
	},
	{
		value: "DEBIT_CARD",
		label: "Tarjeta de débito",
	},
	{
		value: "TRANSFER",
		label: "Transferencia",
	},
	{
		value: "ZELLE",
		label: "Zelle",
	},
	{
		value: "PAYPAL",
		label: "Paypal",
	},
	{
		value: "OTHER",
		label: "Otro",
	},
];

// Helper function to check if a role has higher or equal hierarchy
export const hasHigherOrEqualRole = (
	userRole: keyof typeof roles,
	requiredRole: keyof typeof roles,
): boolean => {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const getRolesWithEqualOrLowerHierarchy = (
	role?: keyof typeof roles,
): Array<keyof typeof roles> => {
	if (!role) {
		return Object.keys(roles) as Array<keyof typeof roles>;
	}
	const roleLevel = ROLE_HIERARCHY[role];
	return Object.entries(ROLE_HIERARCHY)
		.filter(([_, level]) => level <= roleLevel)
		.map(([roleKey]) => roleKey as keyof typeof roles);
};
