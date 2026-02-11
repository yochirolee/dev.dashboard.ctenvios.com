export const ROLES = {
   ROOT: "ROOT",
   ADMINISTRATOR: "ADMINISTRATOR",
   FORWARDER_RESELLER: "FORWARDER_RESELLER",
   AGENCY_SALES: "AGENCY_SALES",
   AGENCY_ADMIN: "AGENCY_ADMIN",
   AGENCY_SUPERVISOR: "AGENCY_SUPERVISOR",
   FORWARDER_ADMIN: "FORWARDER_ADMIN",
   CARRIER_OWNER: "CARRIER_OWNER",
   CARRIER_ADMIN: "CARRIER_ADMIN",
   CARRIER_ISSUES_MANAGER: "CARRIER_ISSUES_MANAGER",
   CARRIER_WAREHOUSE_WORKER: "CARRIER_WAREHOUSE_WORKER",
   MESSENGER: "MESSENGER",
   USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Jerarquía de roles (números más altos = más permisos)
export const ROLE_HIERARCHY: Record<Role, number> = {
   ROOT: 100,
   ADMINISTRATOR: 90,
   FORWARDER_ADMIN: 85,
   FORWARDER_RESELLER: 80,
   CARRIER_OWNER: 75,
   CARRIER_ADMIN: 70,
   AGENCY_ADMIN: 65,
   AGENCY_SUPERVISOR: 60,
   CARRIER_ISSUES_MANAGER: 55,
   AGENCY_SALES: 50,
   CARRIER_WAREHOUSE_WORKER: 45,
   MESSENGER: 40,
   USER: 10,
} as const;

// Grupos de roles para simplificar permisos
export const ROLE_GROUPS = {
   // Administradores del sistema
   SYSTEM_ADMINS: [ROLES.ROOT, ROLES.ADMINISTRATOR],

   // Administradores de agencias
   AGENCY_ADMINS: [ROLES.ROOT, ROLES.ADMINISTRATOR, ROLES.AGENCY_ADMIN, ROLES.AGENCY_SUPERVISOR],

   // Personal de agencias (ventas y admin)
   AGENCY_STAFF: [ROLES.ROOT, ROLES.ADMINISTRATOR, ROLES.AGENCY_ADMIN, ROLES.AGENCY_SUPERVISOR, ROLES.AGENCY_SALES],

   // Administradores de forwarders
   FORWARDER_ADMINS: [ROLES.ROOT, ROLES.ADMINISTRATOR, ROLES.FORWARDER_ADMIN],

   // Personal de carriers
   CARRIER_STAFF: [
      ROLES.ROOT,
      ROLES.ADMINISTRATOR,
      ROLES.CARRIER_OWNER,
      ROLES.CARRIER_ADMIN,
      ROLES.CARRIER_ISSUES_MANAGER,
      ROLES.CARRIER_WAREHOUSE_WORKER,
   ],

   // Mensajeros (todos los tipos)
   MESSENGERS: [ROLES.ROOT, ROLES.ADMINISTRATOR, ROLES.MESSENGER],

   // Usuarios que pueden ver issues
   ISSUES_VIEWERS: [
      ROLES.ROOT,
      ROLES.ADMINISTRATOR,
      ROLES.AGENCY_ADMIN,
      ROLES.AGENCY_SUPERVISOR,
      ROLES.AGENCY_SALES,
      ROLES.MESSENGER,
      ROLES.CARRIER_ISSUES_MANAGER,
   ],
} as const;

// Funciones helper para verificar permisos
export const hasRole = (userRole: Role | null | undefined, allowedRoles: readonly Role[]): boolean => {
   if (!userRole) return false;
   return allowedRoles.includes(userRole);
};

export const hasAnyRole = (userRole: Role | null | undefined, roleGroups: Role[][]): boolean => {
   if (!userRole) return false;
   return roleGroups.some((group) => group.includes(userRole));
};

export const hasMinimumRole = (userRole: Role | null | undefined, minimumRole: Role): boolean => {
   if (!userRole) return false;
   const userLevel = ROLE_HIERARCHY[userRole];
   const minimumLevel = ROLE_HIERARCHY[minimumRole];
   return userLevel >= minimumLevel;
};

// Agency types
export const AGENCY_TYPES = {
   FORWARDER: "FORWARDER",
   AGENCY: "AGENCY",
   RESELLER: "RESELLER",
} as const;

export type AgencyType = (typeof AGENCY_TYPES)[keyof typeof AGENCY_TYPES];

// Check access based on role AND agency type
export const canAccessByAgencyType = (
   userRole: Role | null | undefined,
   agencyType: AgencyType | null | undefined,
   allowedRoles: readonly Role[],
   allowedAgencyTypes?: readonly AgencyType[]
): boolean => {
   // First check if user has one of the allowed roles
   if (hasRole(userRole, allowedRoles)) {
      return true;
   }

   // If agency type conditions are specified, check if AGENCY_ADMIN with allowed agency type
   if (allowedAgencyTypes && agencyType && userRole === ROLES.AGENCY_ADMIN) {
      return allowedAgencyTypes.includes(agencyType);
   }

   return false;
};

// Helper para obtener roles permitidos de forma más legible
export const canAccess = {
   // Finanzas (solo admins)
   finances: ROLE_GROUPS.AGENCY_STAFF,

   // Configuración del sistema (solo admins)
   systemSettings: ROLE_GROUPS.SYSTEM_ADMINS,

   // Logística (admins de agencias y sistema)
   logistics: ROLE_GROUPS.AGENCY_STAFF,

   // Configuración de agencias
   agencySettings: ROLE_GROUPS.AGENCY_ADMINS,

   // Logs del sistema (solo admins principales)
   systemLogs: [ROLES.ROOT, ROLES.ADMINISTRATOR],

   // Issues (varios roles)
   issues: ROLE_GROUPS.ISSUES_VIEWERS,

   // Contenedores y vuelos (admins principales y forwarders)
   containersAndFlights: [ROLES.ROOT, ROLES.ADMINISTRATOR, ROLES.FORWARDER_ADMIN, ROLES.FORWARDER_RESELLER],

   // Órdenes (todos excepto carriers)
   orders: [
      ROLES.ROOT,
      ROLES.ADMINISTRATOR,
      ROLES.FORWARDER_ADMIN,
      ROLES.FORWARDER_RESELLER,
      ROLES.AGENCY_ADMIN,
      ROLES.AGENCY_SUPERVISOR,
      ROLES.AGENCY_SALES,
      ROLES.MESSENGER,
      ROLES.USER,
   ],
} as const;
