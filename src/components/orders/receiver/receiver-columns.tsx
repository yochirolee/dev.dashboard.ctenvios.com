import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { type Receiver } from "@/data/types";

export const receiversColumns: ColumnDef<Receiver>[] = [
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
							{row.original.first_name.charAt(0)}
							{row.original.last_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					{row.original.first_name} {row.original.middle_name || ""}
					{row.original.last_name} {row.original.second_last_name || ""}
				</div>
			);
		},
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2 text-muted-foreground">
					{row.original.mobile || row.original.phone}
				</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <div>{row.original.email}</div>;
		},
	},

	{
		accessorKey: "address",
		header: "Address",
	},
	{
		accessorKey: "province",
		header: "Province",
	},
	{
		accessorKey: "city",
		header: "City",
	},
];
