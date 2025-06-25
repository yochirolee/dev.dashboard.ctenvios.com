import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import type { Customs } from "@/data/types";

export const customsColumns = (): ColumnDef<Customs>[] => [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => {
			return <div>{row.original?.id}</div>;
		},
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <div>{row.original?.name}</div>,
	},
	{
		accessorKey: "fee",
		header: "Fee",
		cell: ({ row }) => <div>{row.original?.fee}</div>,
	},
	{
		accessorKey: "max_quantity",
		header: "Max Quantity",
		cell: ({ row }) => {
			return <div>{row.original?.max_quantity}</div>;
		},
	},

	{
		accessorKey: "fee_type",
		header: "Fee Type",
		cell: ({ row }) => {
			return <div>{row.original?.fee_type}</div>;
		},
	},
	// TODO: Add actions
	{
		accessorKey: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<Button asChild size="icon" variant="ghost">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<PencilIcon className="w-4 h-4 mr-2" />
							Edit
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<TrashIcon className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Button>
		),
	},
];
