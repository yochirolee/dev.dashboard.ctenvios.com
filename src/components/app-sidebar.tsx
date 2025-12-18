import * as React from "react";
import { AlertCircle, FileBox, FileStack, HomeIcon, Settings2, Warehouse, type LucideIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAppStore } from "@/stores/app-store";
import { NavConfig } from "./nav-config";
import { NavIssues } from "./nav-issues";
import { canAccess, hasRole, type Role } from "@/lib/rbac";

interface SidebarSubItem {
   title: string;
   url: string;
   allowedRoles?: readonly Role[];
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
            title: "Despachos",
            url: "/logistics/dispatch",
            allowedRoles: canAccess.logistics,
         },
         {
            title: "Contenedores",
            url: "/logistics/containers",
            allowedRoles: canAccess.containersAndFlights,
         },
         {
            title: "Vuelos",
            url: "/logistics/flights",
            allowedRoles: canAccess.containersAndFlights,
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
      ],
   },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const location = useLocation();
   const { user } = useAppStore();
   const role = user?.role ?? null;

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
      [role]
   );

   const filteredNavMain = React.useMemo(() => filterByRole(navMainItems), [filterByRole]);
   const filteredNavConfig = React.useMemo(() => filterByRole(navConfigItems), [filterByRole]);
   const filteredNavIssues = React.useMemo(() => filterByRole(navIssuesItems), [filterByRole]);
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
