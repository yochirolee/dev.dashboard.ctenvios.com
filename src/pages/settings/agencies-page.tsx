import { AgenciesCombobox } from "@/components/agencies/agencies-combobox";
import { NewAgencyForm } from "@/components/agencies/new-agency-form";
import { NewAgencyDialog } from "@/components/agencies/new-agency-dialog";
import { AgencyDetails } from "@/components/agencies/agency-details";

import AgencyUsers from "@/components/agencies/agency-users";
import AgencyServiceRates from "@/components/agencies/agency-service-rates";
import { useState } from "react";

export const AgenciesPage = () => {
	const [open, setOpen] = useState(false);
	const [selectedAgencyId, setSelectedAgencyId] = useState<number>(1);

	return (
		<div className="flex  flex-col gap-4">
			<div>
				<div className="flex flex-col mb-4">
					<h3 className=" font-bold">Agencias</h3>
					<p className="text-sm text-gray-500 "> Listado de Agencias</p>
				</div>
				<div className="inline-flex items-center gap-2">
					<AgenciesCombobox selectedAgencyId={selectedAgencyId} setSelectedAgencyId={setSelectedAgencyId} />
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
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
				<div className="col-span-1 space-y-4">
					<AgencyDetails agencyId={selectedAgencyId} />
					<AgencyServiceRates agencyId={selectedAgencyId} />
				</div>
				<AgencyUsers agencyId={selectedAgencyId} />
			</div>
		</div>
	);
};
