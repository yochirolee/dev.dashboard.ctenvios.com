
import {
  DropdownMenu,
 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  
} from "@/components/ui/sidebar"
import { Building2 } from "lucide-react";
import { useAgencies } from "@/hooks/use-agencies";
import { useAppStore } from "@/stores/app-store";

export function TeamSwitcher()
  {


  const {user} = useAppStore();
  const {data: agency,isLoading} = useAgencies.getById(user?.agency_id || 0);
  
  if(!agency || isLoading) return (
    <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            
             <SidebarMenuSkeleton showIcon={true} className="" />
            
          
          </SidebarMenuButton>
        </DropdownMenuTrigger>
      
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
  );
 
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
               <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{agency?.name}</span>
                <span className="truncate text-xs">{agency?.agency_type}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
