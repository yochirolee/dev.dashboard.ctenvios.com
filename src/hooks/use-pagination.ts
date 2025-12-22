import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
const usePagination = () => {
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 15,
   });
   return { pagination, setPagination };
};

export default usePagination;
