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
import {
	TableCell,
	TableHeader,
	TableHead,
	TableRow,
	TableBody,
	Table,
} from "@/components/ui/table";
import { AgencyRateDeleteDialog } from "./agency-rate-delete-dialog";
import type { ShippingRate } from "@/data/types";
import { centsToDollars } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { useAgencies } from "@/hooks/use-agencies";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { Skeleton } from "../ui/skeleton";

export const AgencyRates = ({ serviceId, agencyId }: { serviceId: number; agencyId: number }) => {
	const { data: rates, isLoading } = useAgencies.getServiceShippingRates(agencyId, serviceId);

	if (isLoading) return <Skeleton />;

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre</TableHead>
						<TableHead>Tipo</TableHead>
						<TableHead>Costo Agencia</TableHead>
						<TableHead>Venta al Público</TableHead>
						<TableHead>Profit</TableHead>
						<TableHead className="w-10 text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rates?.map((rate: ShippingRate) => (
						<RateRow key={rate.id} rate={rate} />
					))}
				</TableBody>
			</Table>
		</>
	);
};

const RateRow = ({ rate }: { rate: ShippingRate }) => {
	const [openDelete, setOpenDelete] = useState(false);
	const [open, setOpen] = useState(false);

	
	const calculateProfit = (rate: ShippingRate) => {
		return rate?.rate_in_cents - rate?.cost_in_cents;
	};

	console.log(rate, "rate");

	

	return (
		<TableRow key={rate.id} className="border-b-0">
			<TableCell>
				<p>{rate?.name}</p>
			</TableCell>
			<TableCell>
				<Switch checked={rate?.rate_type === "FIXED"} onCheckedChange={() => {}} />
			</TableCell>
			<TableCell>
				<p>{centsToDollars(rate?.cost_in_cents)?.toFixed(2)} USD</p>
			</TableCell>
			<TableCell>
				<p>{centsToDollars(rate?.rate_in_cents)?.toFixed(2)} USD</p>
			</TableCell>
			<TableCell>
				<p>
					{calculateProfit(rate) > 0
						? `+${centsToDollars(calculateProfit(rate))?.toFixed(2)} USD`
						: `${centsToDollars(calculateProfit(rate))?.toFixed(2)} USD`}
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
			<ShareDialog
				title="Editar Tarifas"
				description="Editar las tarifas de los servicios"
				mode="update"
				open={open}
				trigger={false}
				setOpen={setOpen}
			>
				<AgenciesRatesForm rate={rate as unknown as ShippingRate} setOpen={setOpen} mode="update" />
			</ShareDialog>
			<AgencyRateDeleteDialog open={openDelete} setOpen={setOpenDelete} rateId={rate?.id ?? 0} />
		</TableRow>
	);
};
