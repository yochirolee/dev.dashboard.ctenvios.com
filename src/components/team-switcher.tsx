import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Building2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamSwitcher() {
   const { agency } = useAppStore();

   const initials = agency?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                     size="lg"
                     className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                     <Avatar className="lg:size-12 size-8 ">
                        <AvatarImage
                           src={agency?.logo || undefined}
                           alt={agency?.name}
                           className="p-1 object-scale-down"
                        />
                        <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                           {initials || <Building2 className="size-4" />}
                        </AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{agency?.name}</span>
                        <span className="truncate text-xs">{agency?.agency_type}</span>
                     </div>
                  </SidebarMenuButton>
               </DropdownMenuTrigger>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
