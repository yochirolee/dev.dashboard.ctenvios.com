import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const frameworks = [
	{
		value: "Duraderos",
		label: "Duraderos",
	},
	{
		value: "Comida/Aseo/Medicinas",
		label: "Comida/Aseo/Medicinas",
	},
];

interface AgencyRate {
	id: number;
	name: string;
	min_weight: number;
	max_weight: number;
	public_price: number;
	is_sale_by_pounds: boolean;
	categories: Category[];
}

interface Category {
	id: number;
	name: string;
	customs_categories: CustomsCategory[];
}

interface CustomsCategory {
	id: number;
	name: string;
	customs_fee: number;
}
export function AgencyRatesCombobox({
	rates,
	selectedRate,
	setSelectedRate,
}: {
	rates: AgencyRate[];
	selectedRate: AgencyRate | null;
	setSelectedRate: (rate: AgencyRate) => void;
}) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState(rates[0].name);

	console.log(selectedRate, "selectedRate");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{value ? rates.find((rate) => rate.name === value)?.name : "Seleccionar Tarifa..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Buscar Tarifa..." />
					<CommandList>
						<CommandEmpty>No se encontraron tarifas</CommandEmpty>
						<CommandGroup>
							{rates.map((rate) => (
								<CommandItem
									key={rate.name}
									value={rate.name}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
										setSelectedRate(rates.find((rate) => rate.name === currentValue) || null);
									}}
								>
									{rate.name}
									<Check
										className={cn("ml-auto", value === rate.name ? "opacity-100" : "opacity-0")}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
