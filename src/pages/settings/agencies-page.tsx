import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";
import { NewAgencyForm } from "@/components/agencies/new-agency-form";
import { NewAgencyDialog } from "@/components/agencies/new-agency-dialog";
import { AgencyDetails } from "@/components/agencies/agency-details";

import AgencyUsers from "@/components/agencies/agency-users";
import AgencyServiceRates from "@/components/agencies/agency-service-rates";
import { useEffect, useState } from "react";
import { useAgencies } from "@/hooks/use-agencies";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agency } from "@/data/types";

export const AgenciesPage = () => {
	const [open, setOpen] = useState(false);
	const { data: agencies = [], isLoading, error } = useAgencies.get();

	const [selectedAgency, setSelectedAgency] = useState<Agency | null>(agencies[0] ?? null);

	useEffect(() => {
		setSelectedAgency(agencies[0] ?? null);
	}, [agencies]);

	if (isLoading) return <Skeleton className="h-[200px] w-full" />;
	if (error) return <div>Error loading agencies</div>;

	return (
		<div className="flex  flex-col gap-4">
			<div>
				<div className="flex flex-col mb-4">
					<h3 className=" font-bold">Agencias</h3>
					<p className="text-sm text-gray-500 "> Listado de Agencias</p>
				</div>
				{agencies?.length > 1 && (
					<div className="inline-flex items-center gap-2">
						<AgenciesCombobox
							isLoading={isLoading}
							agencies={agencies}
							selectedAgency={selectedAgency}
							setSelectedAgency={setSelectedAgency}
						/>

						<NewAgencyDialog
							title="Nueva Agencia"
							description="Crea una nueva agencia"
							action="Nueva Agencia"
							open={open}
							setOpen={setOpen}
						>
							<NewAgencyForm setOpen={setOpen} />
						</NewAgencyDialog>
					</div>
				)}
			</div>
			{!selectedAgency ? (
				<div>No hay agencia seleccionada</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
					<div className="col-span-1 space-y-4">
						<AgencyDetails selectedAgency={selectedAgency} setSelectedAgency={setSelectedAgency} />
						<AgencyServiceRates agencyId={selectedAgency?.id ?? 0} />
					</div>
					<AgencyUsers selectedAgency={selectedAgency} />
				</div>
			)}
		</div>
	);
};
