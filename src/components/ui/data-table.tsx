import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableRowSkeleton } from "@/components/ui/table-row-skeleton";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: { rows: TData[]; total: number };
	pagination: PaginationState;
	setPagination: (pagination: PaginationState) => void;
	isLoading?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pagination,

	setPagination,
	isLoading = false,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data: data?.rows ?? [],
		columns,
		rowCount: data?.total ?? 0, // new in v8.13.0 - alternatively, just pass in `pageCount` directly
		state: {
			pagination,
		},
		onPaginationChange: (updaterOrValue) => {
			if (typeof updaterOrValue === "function") {
				setPagination(updaterOrValue(pagination));
			} else {
				setPagination(updaterOrValue);
			}
		},

		getCoreRowModel: getCoreRowModel(),
		manualPagination: true, //we're doing manual "server-side" pagination
	});

	return (
		<div className="grid gap-4 rounded-md border pb-2  ">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} className="bg-card">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRowSkeleton rowCount={pagination.pageSize} />
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<DataTablePagination table={table} />
		</div>
	);
}
