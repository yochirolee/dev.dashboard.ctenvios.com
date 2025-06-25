import { DataTable } from "@/components/ui/data-table";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { customsColumns } from "@/components/customs/customs-columns";
import { useCustoms } from "@/hooks/use-customs";
import { NewCustomsForm } from "@/components/customs/new-customs-form";

export const CustomsPage = () => {
	const { data: customs, isLoading } = useCustoms.get();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col ">
				<h3 className=" font-bold">Aranceles Aduanales</h3>
				<p className="text-sm text-gray-500 "> Listado de Aranceles Aduanales</p>
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
					<NewCustomsForm />
				</div>
				{customs && <DataTable columns={customsColumns()} data={customs} />}
			</div>
		</div>
	);
};
