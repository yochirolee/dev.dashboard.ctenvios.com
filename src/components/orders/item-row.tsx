import React, { useEffect, useMemo } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, MoreVertical, ShieldCheck, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function ItemRow({
	index,
	form,
	remove,
	selectedRate,
}: {
	index: number;
	form: any;
	remove: any;
	selectedRate: any;
}) {
	const weight = useWatch({
		control: form.control,
		name: `items.${index}.weight`,
	});
	const customs = useWatch({
		control: form.control,
		name: `items.${index}.customs`,
	});

	const subtotal = useMemo(() => {
		return parseFloat(
			((weight || 0) * (selectedRate?.public_rate || 0) + (customs?.fee || 0)).toFixed(2),
		);
	}, [weight, selectedRate?.public_rate, customs?.fee]);

	// Actualiza el subtotal del ítem
	useEffect(() => {
		form.setValue(`items.${index}.subtotal`, subtotal);
	}, [subtotal, form, index]);

	// Actualiza el total y el peso total
	useEffect(() => {
		const items = form.getValues("items");
		const total = items.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0);
		const totalWeight = items.reduce((acc: number, item: any) => acc + (item.weight || 0), 0);

		form.setValue("total_amount", total);
		form.setValue("total_weight", totalWeight);
	}, [weight, customs, subtotal, form, index]);

	// Actualiza descripción y fee si cambian los customs
	useEffect(() => {
		if (customs?.description) {
			form.setValue(`items.${index}.description`, customs.description);
			form.setValue(`items.${index}.fee`, customs.fee);
		}
	}, [customs?.id, customs?.description, customs?.fee, form, index]);

	return (
		<TableRow key={index}>
			<TableCell>{index + 1}</TableCell>
			<TableCell className="w-10">
				<CustomsFeeCombobox index={index} form={form} />
			</TableCell>
			<TableCell>
				<Input className="w-full" {...form.register(`items.${index}.description`)} />
			</TableCell>
			<TableCell className="text-right">{customs?.fee}</TableCell>

			<TableCell>
				<Input
					className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
					{...form.register(`items.${index}.weight`, {
						valueAsNumber: true,
					})}
					placeholder="0.00"
					type="number"
					min={0.01}
					step={0.01}
					autoComplete="off"
				/>
			</TableCell>
			<TableCell className="text-right">{selectedRate?.public_rate.toFixed(2)}</TableCell>
			<TableCell className="text-right">{subtotal.toFixed(2)}</TableCell>

			<TableCell className="w-10">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem className="flex items-center gap-2">
							<DollarSign />
							<span>Cargo</span>
						</DropdownMenuItem>
						<DropdownMenuItem className="flex items-center gap-2">
							<ShieldCheck />
							<span>Seguro</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={index > 0 ? () => remove(index) : undefined}
						>
							<Trash2 />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}

// Memoizar para evitar re-render si las props no cambian
export default React.memo(ItemRow);
