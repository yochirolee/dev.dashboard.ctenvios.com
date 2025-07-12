import React from "react";
import { receiptsColumns } from "@/components/orders/receipt/receipts-columns";
import { DataTable } from "@/components/ui/data-table";
import { useReceipts } from "@/hooks/use-receipts";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
export const ReceiptsPage = () => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 25,
	});
	const { data: receipts, isLoading } = useReceipts.search(
		debouncedSearchQuery,
		pagination.pageIndex,
		pagination.pageSize,
	);

	return (
		<div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center w-sm relative justify-start">
						{isLoading ? (
							<Loader2 className="w-4 h-4 animate-spin absolute left-4" />
						) : (
							<Search className="w-4 h-4 absolute left-4" />
						)}

						<Input
							type="search"
							className="pl-10"
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
				{receipts && (
					<DataTable
						columns={receiptsColumns}
						data={receipts}
						pagination={pagination}
						setPagination={setPagination}
					/>
				)}
			</div>
		</div>
	);
};
