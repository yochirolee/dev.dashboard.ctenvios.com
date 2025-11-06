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
export const hasHigherOrEqualRole = (userRole: keyof typeof roles, requiredRole: keyof typeof roles): boolean => {
   return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const getRolesWithEqualOrLowerHierarchy = (role?: keyof typeof roles): Array<keyof typeof roles> => {
   if (!role) {
      return Object.keys(roles) as Array<keyof typeof roles>;
   }
   const roleLevel = ROLE_HIERARCHY[role];
   return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level <= roleLevel)
      .map(([roleKey]) => roleKey as keyof typeof roles);
};

// Virtual data for agencies sales chart
export const mockAgenciesSalesData = {
   agencies: [
      {
         agencyId: 1,
         agencyName: "CTEnvios",
         daily: [
            {
               day: "2025-11-01",
               total: 1245.75,
            },
            {
               day: "2025-11-02",
               total: 892.5,
            },
            {
               day: "2025-11-03",
               total: 1567.25,
            },
            {
               day: "2025-11-04",
               total: 1123.0,
            },
            {
               day: "2025-11-05",
               total: 258.31,
            },
         ],
         totalSales: 5086.81,
      },
      {
         agencyId: 2,
         agencyName: "RapidVia Services",
         daily: [
            {
               day: "2025-11-01",
               total: 987.25,
            },
            {
               day: "2025-11-02",
               total: 1456.8,
            },
            {
               day: "2025-11-03",
               total: 2134.5,
            },
            {
               day: "2025-11-04",
               total: 876.33,
            },
            {
               day: "2025-11-05",
               total: 337.43,
            },
         ],
         totalSales: 5792.31,
      },
      {
         agencyId: 3,
         agencyName: "Express Delivery Hub",
         daily: [
            {
               day: "2025-11-01",
               total: 654.9,
            },
            {
               day: "2025-11-02",
               total: 1234.0,
            },
            {
               day: "2025-11-03",
               total: 789.45,
            },
            {
               day: "2025-11-04",
               total: 1567.8,
            },
            {
               day: "2025-11-05",
               total: 923.65,
            },
         ],
         totalSales: 5169.8,
      },
      {
         agencyId: 4,
         agencyName: "Global Shipping Co",
         daily: [
            {
               day: "2025-11-01",
               total: 2345.6,
            },
            {
               day: "2025-11-02",
               total: 1890.25,
            },
            {
               day: "2025-11-03",
               total: 2567.9,
            },
            {
               day: "2025-11-04",
               total: 1456.75,
            },
            {
               day: "2025-11-05",
               total: 1789.45,
            },
         ],
         totalSales: 10049.95,
      },
      {
         agencyId: 5,
         agencyName: "Swift Transport",
         daily: [
            {
               day: "2025-11-01",
               total: 567.3,
            },
            {
               day: "2025-11-02",
               total: 834.5,
            },
            {
               day: "2025-11-03",
               total: 1023.75,
            },
            {
               day: "2025-11-04",
               total: 678.9,
            },
            {
               day: "2025-11-05",
               total: 456.25,
            },
         ],
         totalSales: 3560.7,
      },
   ],
   grandTotal: 29659.57,
};
