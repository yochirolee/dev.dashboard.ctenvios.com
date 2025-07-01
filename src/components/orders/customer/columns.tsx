import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";

import { type Customer } from "@/data/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MoreVertical, Pencil, Trash } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Customer>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "first_name",
		header: "Nombre",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarFallback>
							{row?.original?.first_name?.charAt(0)}
							{row?.original?.last_name?.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div>
						{row?.original?.first_name} {row?.original?.middle_name}
						{row?.original?.last_name} {row?.original?.second_last_name}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "mobile",
		header: "Movil",
	},
	{
		accessorKey: "identity_document",
		header: "Identificacion",
	},
	{
		accessorKey: "email",
		header: "Email",
	},

	{
		accessorKey: "address",
		header: "Address",
	},
];
