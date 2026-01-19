import * as React from "react";
import {
   AlertCircle,
   CreditCard,
   FileBox,
   FileStack,
   HomeIcon,
   Settings2,
   Warehouse,
   type LucideIcon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAppStore } from "@/stores/app-store";
import { NavConfig } from "./nav-config";
import { NavIssues } from "./nav-issues";
import { canAccess, hasRole, canAccessByAgencyType, AGENCY_TYPES, type Role, type AgencyType } from "@/lib/rbac";
import { NavFinances } from "@/components/nav-finances";

interface SidebarSubItem {
   title: string;
   url: string;
   allowedRoles?: readonly Role[];
   allowedAgencyTypes?: readonly AgencyType[];
}

interface SidebarItem {
   title: string;
   url: string;
   icon?: LucideIcon;
   isActive?: boolean;
   allowedRoles?: readonly Role[];
   items?: SidebarSubItem[];
}

const navMainItems: SidebarItem[] = [
   {
      title: "Ordenes",
      url: "#",
      icon: FileBox,
      isActive: true,
      allowedRoles: canAccess.orders,
      items: [
         { title: "Crear Orden", url: "/orders/new", allowedRoles: canAccess.orders },
         { title: "Ordenes", url: "/orders/list", allowedRoles: canAccess.orders },
      ],
   },
   {
      title: "Logistica",
      url: "#",
      icon: Warehouse,
      allowedRoles: canAccess.logistics,
      items: [
         {
            title: "Pallets",
            url: "/logistics/pallets",
            allowedRoles: canAccess.logistics,
         },
         {
            title: "Despachos",
            url: "/logistics/dispatch",
            allowedRoles: canAccess.logistics,
         },

         {
            title: "Contenedores",
            url: "/logistics/containers",
            allowedRoles: canAccess.containersAndFlights,
            allowedAgencyTypes: [AGENCY_TYPES.FORWARDER],
         },
         {
            title: "Vuelos",
            url: "/logistics/flights",
            allowedRoles: canAccess.containersAndFlights,
            allowedAgencyTypes: [AGENCY_TYPES.FORWARDER],
         },
      ],
   },
   {
      title: "Settings",
      url: "#",
      icon: Settings2,
      allowedRoles: canAccess.agencySettings,
      items: [
         {
            title: "Providers",
            url: "/settings/providers",
            allowedRoles: canAccess.systemSettings,
         },
         {
            title: "Agencies",
            url: "/settings/agencies",
            allowedRoles: canAccess.agencySettings,
         },
         {
            title: "Customers",
            url: "/settings/customers",
            allowedRoles: canAccess.systemSettings,
         },
         {
            title: "Receivers",
            url: "/settings/receivers",
            allowedRoles: canAccess.systemSettings,
         },
         {
            title: "Aranceles",
            url: "/settings/customs",
            allowedRoles: canAccess.systemSettings,
         },
         {
            title: "Usuarios",
            url: "/settings/users",
            allowedRoles: canAccess.systemSettings,
         },
      ],
   },
];

const navConfigItems: SidebarItem[] = [
   {
      title: "Logs",
      url: "#",
      icon: FileStack,
      allowedRoles: canAccess.systemLogs,
      items: [
         {
            title: "App Logs",
            url: "/logs/app-logs",
            allowedRoles: canAccess.systemLogs,
         },
         {
            title: "Partners Logs",
            url: "/logs/partners-logs",
            allowedRoles: canAccess.systemLogs,
         },
      ],
   },
];

const navFinancesItems: SidebarItem[] = [
   {
      title: "Finanzas",
      url: "#",
      icon: CreditCard,
      allowedRoles: canAccess.finances,
      items: [
         {
            title: "Cierre Diario",
            url: "/finances/daily-closure",
            allowedRoles: canAccess.finances,
         },
      ],
   },
];

const navIssuesItems: SidebarItem[] = [
   {
      title: "Issues",
      url: "#",
      icon: AlertCircle,
      allowedRoles: canAccess.issues,
      items: [
         {
            title: "Reclamaciones",
            url: "/legacy-issues",
            allowedRoles: canAccess.issues,
         },
         {
            title: "HM Paquetes",
            url: "/hm-paquetes",
            allowedRoles: canAccess.issues,
         },
      ],
   },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const location = useLocation();
   const { user, agency } = useAppStore();
   const role = user?.role ?? null;
   const agencyType = agency?.agency_type as AgencyType | undefined;

   const filterByRole = React.useCallback(
      (items: SidebarItem[]): SidebarItem[] =>
         items
            .filter((item) => {
               if (!item.allowedRoles?.length) {
                  return true;
               }
               return hasRole(role as Role, item.allowedRoles);
            })
            .map((item) => {
               const visibleSubItems = item.items?.filter((subItem) => {
                  if (!subItem.allowedRoles?.length) {
                     return true;
                  }
                  // Use canAccessByAgencyType if allowedAgencyTypes is specified
                  if (subItem.allowedAgencyTypes?.length) {
                     return canAccessByAgencyType(
                        role as Role,
                        agencyType,
                        subItem.allowedRoles,
                        subItem.allowedAgencyTypes
                     );
                  }
                  return hasRole(role as Role, subItem.allowedRoles);
               });
               return {
                  ...item,
                  items: visibleSubItems,
               };
            })
            .filter((item) => {
               if (!item.items) {
                  return true;
               }
               return item.items.length > 0;
            }),
      [role, agencyType]
   );

   const filteredNavMain = React.useMemo(() => filterByRole(navMainItems), [filterByRole]);
   const filteredNavConfig = React.useMemo(() => filterByRole(navConfigItems), [filterByRole]);
   const filteredNavIssues = React.useMemo(() => filterByRole(navIssuesItems), [filterByRole]);
   const filteredNavFinances = React.useMemo(() => filterByRole(navFinancesItems), [filterByRole]);
   return (
      <Sidebar collapsible="icon" {...props}>
         <SidebarHeader>
            <TeamSwitcher />
         </SidebarHeader>
         <SidebarContent className="[scrollbar-color:--alpha(var(--foreground)/20%)_transparent] [scrollbar-width:thin]">
            <Link to="/" className="mx-2">
               <Button variant={location.pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start ">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Inicio
               </Button>
            </Link>
            {filteredNavMain.length > 0 && <NavMain items={filteredNavMain} />}
            {filteredNavFinances.length > 0 && <NavFinances items={filteredNavFinances} />}
            {filteredNavIssues.length > 0 && <NavIssues items={filteredNavIssues} />}
            {filteredNavConfig.length > 0 && <NavConfig items={filteredNavConfig} />}
         </SidebarContent>
         <SidebarFooter>
            <NavUser />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   );
}
