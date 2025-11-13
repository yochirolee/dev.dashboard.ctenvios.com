import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { dispatchColumns } from "./dispatch-columns";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Field, FieldContent } from "@/components/ui/field";
import type { DispatchItem } from "../create-dispatch-page";

const searchForm = z.object({
   hbl: z.string().min(1),
});

const SearchFormComponent = ({
   handleSearch = () => {},
}: {
   handleSearch: (data: z.infer<typeof searchForm>) => void;
}) => {
   const { register, handleSubmit, reset } = useForm<z.infer<typeof searchForm>>({
      resolver: zodResolver(searchForm),
   });
   const onSubmit = (data: z.infer<typeof searchForm>) => {
      handleSearch(data);
      reset();
   };
   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <Field orientation="horizontal">
            <FieldContent>
               <ButtonGroup orientation="horizontal" className="w-full lg:w-md">
                  <InputGroup>
                     <InputGroupInput type="search" placeholder="Search" {...register("hbl")} />
                     <InputGroupAddon>
                        {false ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                     </InputGroupAddon>
                  </InputGroup>
                  <Button variant="outline" type="submit">
                     Scan By HBL
                  </Button>
               </ButtonGroup>
            </FieldContent>
         </Field>
      </form>
   );
};

export const ReceiveDispatch = ({
   items,
   pagination,
   setPagination,
   isLoading,
}: {
   items: DispatchItem[];
   pagination: PaginationState;
   setPagination: (pagination: PaginationState) => void;
   isLoading: boolean;
}) => {
   const [data, setData] = useState<DispatchItem[]>([]);

   const handleSearch = (formData: z.infer<typeof searchForm>) => {
      const item = items.find((item: DispatchItem) => item.hbl === formData.hbl);
      if (item) {
         setData([...data, { ...item, status: "RECEIVED" } as DispatchItem]);
      } else {
         toast.error(`Item ${formData.hbl} not found`);
      }
   };
   return (
      <div className="col-span-12 md:col-span-9 p-4 space-y-4">
         <div className="flex justify-between gap-2">
            <SearchFormComponent handleSearch={(data) => handleSearch(data)} />

            <ButtonGroup orientation="horizontal" className="w-fit">
               <Button variant="outline">
                  Total: <span className="font-bold">{data?.length}</span>
               </Button>
               <Button variant="outline">
                  Correctos: <span className="font-bold">0</span>
               </Button>
               <Button variant="outline">
                  Faltantes: <span className="font-bold">0</span>
               </Button>
            </ButtonGroup>
         </div>
         <DataTable
            columns={dispatchColumns}
            data={{ rows: data , total: data.length }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
