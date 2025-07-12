import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableRowSkeletonProps {
	columnCount?: number;
	rowCount?: number;
}

export function TableRowSkeleton({
	columnCount = 10,
	rowCount = 5,
}: TableRowSkeletonProps): JSX.Element {
	return (
		<>
			{Array.from({ length: rowCount }, (_, rowIndex) => (
				<TableRow key={`skeleton-row-${rowIndex}`}>
					{/* Checkbox column */}
					<TableCell>
						<Skeleton className="h-4 w-4 rounded" />
					</TableCell>

					{/* ID column */}
					<TableCell>
						<Skeleton className="h-4 w-8" />
					</TableCell>

					{/* Agency name column */}
					<TableCell>
						<Skeleton className="h-4 w-20" />
					</TableCell>

					{/* Service badge column */}
					<TableCell>
						<Skeleton className="h-6 w-16 rounded-full" />
					</TableCell>

					{/* Date column */}
					<TableCell>
						<Skeleton className="h-4 w-24" />
					</TableCell>

					{/* Customer (avatar + name) column */}
					<TableCell>
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-8 rounded-full" />
							<Skeleton className="h-4 w-32" />
						</div>
					</TableCell>

					{/* Receipt (avatar + name) column */}
					<TableCell>
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-8 rounded-full" />
							<Skeleton className="h-4 w-32" />
						</div>
					</TableCell>

					{/* Payment status badge column */}
					<TableCell>
						<Skeleton className="h-6 w-16 rounded-full" />
					</TableCell>

					{/* Total amount column */}
					<TableCell>
						<div className="text-right">
							<Skeleton className="h-4 w-14 ml-auto" />
						</div>
					</TableCell>

					{/* Actions column */}
					<TableCell>
						<div className="flex justify-end">
							<Skeleton className="h-8 w-8 rounded" />
						</div>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}
