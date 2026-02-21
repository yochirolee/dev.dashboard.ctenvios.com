import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

export const ShareDialog = ({
   children,
   title,
   description,
   mode,
   open,
   setOpen,
   expanded,
   trigger = true,
}: {
   children: React.ReactNode;
   title: string;
   description: string;
   mode: "create" | "update";
   open: boolean;
   setOpen: (open: boolean) => void;
   expanded?: boolean;
   trigger?: boolean | undefined;
}) => {
   console.log(mode, "mode");
   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            {trigger && (
               <Button variant="outline">
                  <PlusCircle className="w-4 h-4" />
                  <span className={`${expanded ? "block" : "hidden"} lg:block`}>
                     {mode === "create" ? "Crear" : "Editar"}
                  </span>
               </Button>
            )}
         </DialogTrigger>
         <DialogContent className="sm:max-w-[550px] p-4  ">
            <DialogHeader>
               <DialogTitle>{title}</DialogTitle>
               <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
         </DialogContent>
      </Dialog>
   );
};
