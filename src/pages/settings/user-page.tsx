import { DataTable } from "@/components/ui/data-table";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { userColumns } from "@/components/users/users-columns";
import { useGetUsers } from "@/hooks/use-users";
import { toast } from "sonner";
import { UserRegisterForm } from "@/components/users/user-register-form";

export const UserPage = () => {
	const { data: users, isLoading } = useGetUsers();
	const handleDeleteUser = (id: string) => {
		toast.success("User deleted successfully");
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col ">
				<h3 className=" font-bold">Usuarios</h3>
				<p className="text-sm text-gray-500 "> Listado de Usuarios</p>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center w-sm relative justify-start">
						{isLoading ? (
							<Loader2 className="w-4 h-4 animate-spin absolute left-4" />
						) : (
							<Search className="w-4 h-4 absolute left-4" />
						)}

						<Input type="search" className="pl-10" />
					</div>
					<UserRegisterForm />
				</div>
				{users && <DataTable columns={userColumns(handleDeleteUser)} data={users} />}
			</div>
		</div>
	);
};
