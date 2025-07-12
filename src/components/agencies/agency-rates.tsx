import { useState } from "react";
import { ShareDialog } from "../shares/share-dialog";
import { AgenciesRatesForm } from "./agencies-rates-form";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { AgencyRateDeleteDialog } from "./agency-rate-delete-dialog";

type AgencyRatesProps = {
	rate: any;
};

export const AgencyRates = ({ rate }: AgencyRatesProps) => {
	const [openDelete, setOpenDelete] = useState(false);
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow className="border-b-0">
				<TableCell>
					<p>{rate?.name}</p>
				</TableCell>
				<TableCell>
					<p>{parseFloat(rate.agency_rate).toFixed(2)} USD</p>
				</TableCell>
				<TableCell>
					<p>{parseFloat(rate.public_rate).toFixed(2)} USD</p>
				</TableCell>
				<TableCell>
					<p>
						{parseFloat(rate.public_rate) - parseFloat(rate.agency_rate) > 0
							? `+${(parseFloat(rate.public_rate) - parseFloat(rate.agency_rate)).toFixed(2)} USD`
							: `${(parseFloat(rate.public_rate) - parseFloat(rate.agency_rate)).toFixed(2)} USD`}
					</p>
				</TableCell>
				<TableCell className="flex justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreVerticalIcon size={16} />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setOpen(true)}>
								<PencilIcon size={16} /> Editar
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setOpenDelete(true)}>
								<Trash2Icon size={16} /> Eliminar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TableCell>
			</TableRow>
			<ShareDialog
				title="Editar Tarifas"
				description="Editar las tarifas de los servicios"
				mode="update"
				open={open}
				trigger={false}
				setOpen={setOpen}
			>
				<AgenciesRatesForm rate={rate} setOpen={setOpen} mode="update" />
			</ShareDialog>
			<AgencyRateDeleteDialog open={openDelete} setOpen={setOpenDelete} rateId={rate?.id} />
		</>
	);
};
