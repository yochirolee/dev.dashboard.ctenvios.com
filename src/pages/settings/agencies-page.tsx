import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";

import { AgencyDetails } from "@/components/agencies/agency-details";

import AgencyUsers from "@/components/agencies/agency-users";
import AgencyServiceRates from "@/components/agencies/agency-service-rates";
import { useEffect, useState} from "react";
import { useAgencies } from "@/hooks/use-agencies";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agency, User, Service, ShippingRate, Provider } from "@/data/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AgencyDetailsProps {
	selectedAgency: Agency & {
		users: User[];
		services: Service[] & {
			provider: Provider & {
				name: string;
			};
			shipping_rates: ShippingRate[];
		};
	};
	isLoading: boolean;
}

export const AgenciesPage = () => {
	const navigate = useNavigate();
	const { data: agencies = [], isLoading, error } = useAgencies.get();
	const [selectedAgency, setSelectedAgency] = useState<AgencyDetailsProps["selectedAgency"]>(agencies[0] ?? null);
    
	useEffect(() => {
		setSelectedAgency(agencies[0] ?? null as unknown as AgencyDetailsProps["selectedAgency"]);
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
							setSelectedAgency={(agency) => setSelectedAgency(agency as Agency & { services: Service[] & { provider: Provider & { name: string }; shipping_rates: ShippingRate[] } })}
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
						<AgencyDetails selectedAgency={selectedAgency} setSelectedAgency={(agency) => setSelectedAgency(agency as AgencyDetailsProps["selectedAgency"])} />
						<AgencyUsers selectedAgency={selectedAgency as AgencyDetailsProps["selectedAgency"]} />
					</div>
					<div className="col-span-3 space-y-4">
						<AgencyServiceRates selectedAgency={selectedAgency as AgencyDetailsProps["selectedAgency"]} />
					</div>
				</div>
			)}
		</div>
	);
};
