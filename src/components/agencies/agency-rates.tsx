import { useState } from "react";
import { ShareDialog } from "../shares/share-dialog";
import { AgenciesRatesForm } from "./agencies-rates-form";

type AgencyRatesProps = {
	rate: any;
};

export const AgencyRates = ({ rate }: AgencyRatesProps) => {
	const [open, setOpen] = useState(false);
	return (
		<div key={rate.id} className="flex my-4 border-t  pt-4 justify-between items-center gap-2">
			<div>
				<p>{rate?.name}</p>
			</div>
			<div>
				<p>Costo Agencia</p>
				<p>{parseFloat(rate.agency_rate).toFixed(2)} USD</p>
			</div>
			<div>
				<p>Venta al Público</p>
				<p>{parseFloat(rate.public_rate).toFixed(2)} USD</p>
			</div>
			<div>
				<p>Profit</p>
				<p>
					{parseFloat(rate.public_rate) - parseFloat(rate.agency_rate) > 0
						? `+${(parseFloat(rate.public_rate) - parseFloat(rate.agency_rate)).toFixed(2)} USD`
						: `${(parseFloat(rate.public_rate) - parseFloat(rate.agency_rate)).toFixed(2)} USD`}
				</p>
			</div>

			<ShareDialog
				title="Editar Tarifas"
				description="Editar las tarifas de los servicios"
				mode="update"
				open={open}
				setOpen={setOpen}
			>
				<AgenciesRatesForm rate={rate} setOpen={setOpen} mode="update" />
			</ShareDialog>
		</div>
	);
};
