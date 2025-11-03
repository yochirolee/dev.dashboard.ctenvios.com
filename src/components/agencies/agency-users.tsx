import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAgencies } from "@/hooks/use-agencies";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { UserRegisterForm } from "../users/user-register-form";

export default function AgencyUsers({ agency_id }: { agency_id: number }) {
	const { data: users, isLoading } = useAgencies.getUsers(agency_id);
	if (isLoading) return <Skeleton className="h-[400px] w-full" />;
	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center gap-2">
					<CardTitle className=" flex flex-col">
						<p>Usuarios de la agencia</p>
						<p className="text-sm text-muted-foreground">
							Listado de usuarios de la agencia.
						</p>
					</CardTitle>

					<UserRegisterForm agencyId={agency_id} />
				</div>
			</CardHeader>
			<Separator />
			<CardContent className="flex flex-col space-y-4">
				{users?.map((user: any) => (
					<div key={user.id} className="flex flex-wrap items-center gap-4">
						<Avatar className="hidden h-9 w-9 sm:flex">
							<AvatarImage src={user.avatar} alt="Avatar" />
							<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="grid gap-1">
							<p className="text-sm font-medium leading-none">{user.name}</p>
							<p className="text-sm text-muted-foreground">{user.email}</p>
						</div>
						<div className="ml-auto font-medium flex items-center gap-4">
							<Badge variant="secondary">{user.role}</Badge>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>
										<Pencil className="h-4 w-4" />
										Editar usuario
									</DropdownMenuItem>
									<DropdownMenuItem>
										<KeyRound className="h-4 w-4" />
										Reset Password
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Trash2 className="h-4 w-4" />
										Eliminar usuario
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
