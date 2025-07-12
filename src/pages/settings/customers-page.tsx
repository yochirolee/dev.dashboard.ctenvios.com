import React, { useState } from "react";
import { columns } from "@/components/orders/customer/columns";
import { DataTable } from "@/components/ui/data-table";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { CustomerFormDialog } from "@/components/orders/customer/customer-form-dialog";
import type { PaginationState } from "@tanstack/react-table";

export const CustomersPage = () => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 25,
	});
	const { data, isLoading } = useCustomers.search(
		debouncedSearchQuery,
		pagination.pageIndex,
		pagination.pageSize,
	);

	return (
		<div className="flex flex-col gap-4 ">
			<div className="flex items-center space-x-2 w-sm relative justify-start">
				{isLoading ? (
					<Loader2 className="w-4 h-4 animate-spin absolute left-4" />
				) : (
					<Search className="w-4 h-4 absolute left-4" />
				)}
				<Input type="search" className="pl-10" onChange={(e) => setSearchQuery(e.target.value)} />
				<CustomerFormDialog />
			</div>
			<DataTable
				pagination={pagination}
				setPagination={setPagination}
				columns={columns}
				data={data}
				isLoading={isLoading}
			/>
		</div>
	);
};
