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

interface SidebarSubItem {
   title: string;
   url: string;
   allowedRoles?: string[];
}

interface SidebarItem {
   title: string;
   url: string;
   icon?: LucideIcon;
   isActive?: boolean;
   allowedRoles?: string[];
   items?: SidebarSubItem[];
}


const navMainItems: SidebarItem[] = [
   {
      title: "Ordenes",
      url: "#",
      icon: FileBox,
      isActive: true,
      items: [
         { title: "Crear Orden", url: "/orders/new" },
         { title: "Ordenes", url: "/orders/list" },
      ],
   },
   {
      title: "Logistica",
      url: "#",
      icon: Warehouse,
      allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"],
      items: [
         {
            title: "Despachos",
            url: "/logistics/dispatch",
            allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"],
         },
         {
            title: "Contenedores",
            url: "/logistics/containers",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Vuelos",
            url: "/logistics/flights",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
      ],
   },
   {
      title: "Settings",
      url: "#",
      icon: Settings2,
      allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"],
      items: [
         {
            title: "Providers",
            url: "/settings/providers",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Agencies",
            url: "/settings/agencies",
            allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"],
         },
         {
            title: "Customers",
            url: "/settings/customers",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Receivers",
            url: "/settings/receivers",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Aranceles",
            url: "/settings/customs",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Usuarios",
            url: "/settings/users",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
      ],
   },
];

const navConfigItems: SidebarItem[] = [
   {
      title: "Logs",
      url: "#",
      icon: FileStack,
      allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"],
      items: [
         {
            title: "App Logs",
            url: "/logs/app-logs",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
         {
            title: "Partners Logs",
            url: "/logs/partners-logs",
            allowedRoles: ["ROOT", "ADMINISTRATOR"],
         },
      ],
   },
];

const navIssuesItems: SidebarItem[] = [
   {
      title: "Issues",
      url: "#",
      icon: AlertCircle,
      allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN","MESSENGER"],
      items: [
         {
            title: "Reclamaciones",
            url: "/issues",
            allowedRoles: ["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN","MESSENGER"],
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
               return role ? item.allowedRoles.includes(role) : false;
            })
            .map((item) => {
               const visibleSubItems = item.items?.filter((subItem) => {
                  if (!subItem.allowedRoles?.length) {
                     return true;
                  }
                  return role ? subItem.allowedRoles.includes(role) : false;
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
            <NavMain items={filteredNavMain} />
            <NavIssues items={filteredNavIssues} />
            <NavConfig items={filteredNavConfig} />
         </SidebarContent>
         <SidebarFooter>
            <NavUser />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   );
}
