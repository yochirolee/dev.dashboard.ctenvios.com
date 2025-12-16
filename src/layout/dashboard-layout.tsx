import { AppSidebar } from "@/components/app-sidebar";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

export const DashboardLayout = () => {
   const pathname = useLocation();
   const breadcrumb = pathname.pathname.split("/").filter(Boolean);
   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset>
            <header className="flex h-10 md:h-12 border-b  border-foreground/10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
               <div className="flex justify-between items-center  px-2  w-full">
                  <div className="flex items-center gap-2 ">
                     <SidebarTrigger className="-ml-1" />
                     <Separator orientation="vertical" className="mr-0 h-4" />
                     <Breadcrumb>
                        <BreadcrumbList>
                           <BreadcrumbItem className="hidden md:block">
                              <BreadcrumbLink asChild>
                                 <Link to={breadcrumb[0] ? `/${breadcrumb[0]}` : "/"}>
                                    {breadcrumb[0]
                                       ? breadcrumb[0]?.charAt(0).toUpperCase() + breadcrumb[0]?.slice(1)
                                       : "Home"}
                                 </Link>
                              </BreadcrumbLink>
                           </BreadcrumbItem>
                           <BreadcrumbSeparator className="hidden mt-1 md:block" />
                           <BreadcrumbItem>
                              <BreadcrumbPage>
                                 {breadcrumb[1]?.charAt(0).toUpperCase() + breadcrumb[1]?.slice(1) || ""}
                              </BreadcrumbPage>
                           </BreadcrumbItem>
                        </BreadcrumbList>
                     </Breadcrumb>
                  </div>
                  <ModeToggle />
               </div>
            </header>
            <div className="flex flex-1 flex-col ">
               <Outlet />
               <Toaster />
            </div>
         </SidebarInset>
      </SidebarProvider>
   );
};
