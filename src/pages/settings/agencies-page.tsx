import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";

import { AgencyDetails } from "@/components/agencies/agency-details";

import AgencyUsers from "@/components/agencies/agency-users";
import AgencyServiceRates from "@/components/agencies/agency-service-rates";
import { useEffect, useState } from "react";
import { useAgencies } from "@/hooks/use-agencies";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agency } from "@/data/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AgenciesPage = () => {
	const navigate = useNavigate();
	const { data: agencies = [], isLoading, error } = useAgencies.get();
	const [selectedAgency, setSelectedAgency] = useState<Agency | null>(agencies[0] ?? null);

	useEffect(() => {
		setSelectedAgency(agencies[0] as Agency);
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
				{agencies?.length > 0 && (
					<div className="inline-flex items-center gap-2">
						<AgenciesCombobox
							isLoading={isLoading}
							agencies={agencies}
							selectedAgency={selectedAgency}
							setSelectedAgency={(agency) => setSelectedAgency(agency)}
						/>

						<Button
							variant="outline"
							onClick={() => {
								navigate("/settings/agencies/new");
							}}
						>
							Nueva Agencia
						</Button>
					</div>
				)}
			</div>
			{!selectedAgency ? (
				<div>No hay agencia seleccionada</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-5  gap-4">
					<div className="col-span-2 space-y-4">
						<AgencyDetails selectedAgency={selectedAgency} />
						<AgencyUsers agency_id={selectedAgency.id ?? 0} />
					</div>
					<div className="col-span-3 space-y-4">
						<AgencyServiceRates agencyId={selectedAgency.id ?? 0} />
					</div>
				</div>
			)}
		</div>
	);
};
