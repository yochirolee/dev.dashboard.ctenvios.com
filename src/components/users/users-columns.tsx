import { type ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, KeyIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Switch } from "../ui/switch";
import type { User } from "@/data/types";

export const userColumns = (handleDeleteUser: (id: number) => void): ColumnDef<User>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {
			const user = row.original;
			return (
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8">
						<AvatarFallback>{row.original?.name?.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{user.name}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "agency",
		header: "Agency",
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">{row.original?.agency?.name}</div>
		),
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => <Badge variant="secondary">{row.getValue("role")}</Badge>,
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: ({ row }) => <Switch checked={row.original?.emailVerified ?? false} />,
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => (
			<div>
				{formatDistance(new Date(row.original?.createdAt), new Date())}
			</div>
		),
	},

	{
		accessorKey: "lastLogin",
		header: "Last Active",
		cell: ({ row }) => {
			return <div>{formatDistance(new Date(row.original?.updatedAt), new Date())}</div>;
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
						<DropdownMenuItem>
							<KeyIcon className="w-4 h-4 mr-2" />
							Reset Password
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleDeleteUser(row.original.id)}>
							<TrashIcon className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Button>
		),
	},
];
