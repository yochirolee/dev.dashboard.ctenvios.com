import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EllipsisVertical, FileText, Pencil, Printer, TagIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Invoice = {
	id: number;
	agency: {
		id: number;
		name: string;
	};
	customer: {
		id: number;
		first_name: string;
		middle_name: string;
		last_name: string;
		second_last_name: string;
		mobile: string;
	};
	receipt: {
		id: number;
		first_name: string;
		middle_name: string;
		last_name: string;
		second_last_name: string;
		mobile: string;
	};
	service: {
		id: number;
		name: string;
	};
	payment_status: boolean;
	status: string;
	created_at: string;
	updated_at: string;
	total_amount: number;
	_count: {
		items: number;
	};
};

const baseUrl = import.meta.env.VITE_API_URL;

export const orderColumns: ColumnDef<Invoice>[] = [
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
		accessorKey: "id",
		header: "Factura",
		cell: ({ row }) => {
			return (
				<Link className="flex items-center gap-2" to={`/orders/${row.original?.id}`}>
					<FileText size={16} />
					{row.original?.id}
				</Link>
			);
		},
	},
	{
		accessorKey: "_count",
		header: "Labels",
		cell: ({ row }) => {
			return (
				<Badge variant="secondary" className="flex items-center gap-2">
					<Link
						className="flex items-center gap-2"
						target="_blank"
						to={`${baseUrl}/invoices/${row.original?.id}/labels`}
					>
						<span className="">{row?.original?._count.items}</span>
						<TagIcon size={16} />
					</Link>
				</Badge>
			);
		},
	},

	{
		accessorKey: "agency.name",
		header: "Agencia",
		cell: ({ row }) => {
			return <div>{row.original?.agency?.name}</div>;
		},
	},

	{
		accessorKey: "service",
		header: "Servicio",
		cell: ({ row }) => {
			return <Badge variant="secondary">{row.original?.service?.name}</Badge>;
		},
	},
	{
		accessorKey: "created_at",
		header: "Fecha",
		cell: ({ row }) => {
			return <div>{format(new Date(row.original?.created_at), "dd/MM/yyyy HH:mm a")}</div>;
		},
	},

	{
		accessorKey: "customer",
		header: "Envia",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8 shrink-0">
						<AvatarFallback>
							{row.original?.customer?.first_name.charAt(0)}
							{row.original?.customer?.last_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="truncate">
						{row.original?.customer?.first_name} {row.original?.customer?.middle_name}{" "}
						{row.original?.customer?.last_name} {row.original?.customer?.second_last_name}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "receipt",
		header: "Recibe",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8 shrink-0">
						<AvatarFallback>
							{row.original?.receipt?.first_name.charAt(0)}
							{row.original?.receipt?.last_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="truncate">
						{row.original?.receipt?.first_name} {row.original?.receipt?.middle_name}{" "}
						{row.original?.receipt?.last_name} {row.original?.receipt?.second_last_name}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			return <Badge variant="secondary">{row.original?.status}</Badge>;
		},
	},

	{
		accessorKey: "payment_status",
		header: "Payment",
		cell: ({ row }) => {
			return <Badge variant="outline">{row.original?.payment_status ? "Pending" : "Paid"}</Badge>;
		},
	},

	{
		accessorKey: "subtotal",
		header: "Total",
		cell: ({ row }) => {
			return (
				<div className="text-right w-14  ">
					{parseFloat(row.original?.total_amount.toString()).toFixed(2)}
				</div>
			);
		},
	},
	{
		header: "Actions",
		cell: ({ row }) => {
			return (
				<div className="flex justify-center max-w-6  ">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<EllipsisVertical className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<Link to={`/orders/${row.original.id}`}>
								<DropdownMenuItem>
									<Printer className="w-4 h-4" />
									Print
								</DropdownMenuItem>
							</Link>
							<Link to={`/orders/${row.original.id}/edit`}>
								<DropdownMenuItem>
									<Pencil className="w-4 h-4" />
									Editar
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem>
								<Trash className="w-4 h-4" />
								Eliminar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
