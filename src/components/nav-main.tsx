import { Link, useLocation } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { type Role } from "@/lib/rbac";

interface NavMainSubItem {
   title: string;
   url: string;
   allowedRoles?: readonly Role[];
}

interface NavMainItem {
   title: string;
   url: string;
   icon?: LucideIcon;
   isActive?: boolean;
   allowedRoles?: readonly Role[];
   items?: NavMainSubItem[];
}

export function NavMain({ items }: { items: NavMainItem[] }) {
   const location = useLocation();

   return (
      <SidebarGroup>
         <SidebarGroupLabel>Facturación</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) => (
               <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                  <SidebarMenuItem>
                     <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                           {item.icon && <item.icon />}
                           <span>{item.title}</span>
                           <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                     </CollapsibleTrigger>
                     <CollapsibleContent>
                        <SidebarMenuSub>
                           {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                 <SidebarMenuSubButton asChild>
                                    <Link
                                       className={cn(location.pathname === subItem.url && "bg-secondary")}
                                       to={subItem.url}
                                    >
                                       <span>{subItem.title}</span>
                                    </Link>
                                 </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                           ))}
                        </SidebarMenuSub>
                     </CollapsibleContent>
                  </SidebarMenuItem>
               </Collapsible>
            ))}
         </SidebarMenu>
      </SidebarGroup>
   );
}
