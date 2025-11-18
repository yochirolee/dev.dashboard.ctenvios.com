import { DataTable } from "@/components/ui/data-table";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { userColumns } from "@/components/users/users-columns";
import { useGetUsers } from "@/hooks/use-users";
import { toast } from "sonner";
import usePagination from "@/hooks/use-pagination";
export const UserPage = () => {
	const { pagination, setPagination } = usePagination();
	const { data: users, isLoading } = useGetUsers(pagination.pageIndex , pagination.pageSize);
	const handleDeleteUser = () => {
		toast.success("Usuario eliminado correctamente", {
			description: "El usuario ha sido eliminado correctamente",
		});
	};

	console.log(users, "users");

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
				</div>

				<DataTable
					pagination={pagination}
					setPagination={setPagination}
					columns={userColumns(handleDeleteUser)}
					data={users}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
};
