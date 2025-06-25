import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgenciesRatesForm from "@/components/agencies/agencies-rates-form";
import { DataTable } from "@/components/ui/data-table";
import { userColumns } from "@/components/users/users-columns";

export const AgenciesPage = () => {
	const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
	return (
		<div className="flex flex-col gap-4">
			<div>
				<div className="flex flex-col mb-4">
					<h3 className=" font-bold">Agencias</h3>
					<p className="text-sm text-gray-500 "> Listado de Agencias</p>
				</div>
				<div className="flex items-center gap-2">
					<AgenciesCombobox setSelectedAgency={setSelectedAgency} />
					<Button>
						<Plus className="w-4 h-4" />
						Agregar Agencia
					</Button>
				</div>
			</div>

			<Tabs>
				<TabsList>
					<TabsTrigger value="rates">Tarifas</TabsTrigger>
					<TabsTrigger value="users">Usuarios</TabsTrigger>
				</TabsList>
				<TabsContent value="rates">
					<div>
						<AgenciesRatesForm />
					</div>
				</TabsContent>
				<TabsContent value="users">
					<div>Usuarios</div>
					<DataTable columns={userColumns} data={[]} total={0} page={1} />
				</TabsContent>
			</Tabs>
		</div>
	);
};
