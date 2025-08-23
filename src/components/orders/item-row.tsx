import React, { useEffect, useMemo } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, PencilIcon, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Badge } from "../ui/badge";

function ItemRow({
	index,
	form,
	remove,
	selectedRate,
	openDialog,
}: {
	index: number;
	form: any;
	remove: any;
	selectedRate: any;
	openDialog: (type: "insurance" | "charge" | "rate", index: number) => void;
}) {
	const weight = useWatch({
		control: form.control,
		name: `items.${index}.weight`,
	});
	const customs = useWatch({
		control: form.control,
		name: `items.${index}.customs`,
	});
	const insuranceFee = useWatch({
		control: form.control,
		name: `items.${index}.insurance_fee`,
	});
	const subtotal = useMemo(() => {
		if (parseFloat(weight) > 100) {
			form.setValue(`items.${index}.charge_fee`, 30);
		} else {
			form.setValue(`items.${index}.charge_fee`, 0);
		}
		const subtotal = parseFloat(
			(
				(weight || 0) * (selectedRate?.public_rate || 0) +
				(customs?.fee / 100 || 0) +
				(parseFloat(insuranceFee) || 0) +
				(parseFloat(form.getValues(`items.${index}.charge_fee`)) || 0)
			).toFixed(2),
		);

		return subtotal;
	}, [weight, selectedRate?.public_rate, customs?.fee, insuranceFee]);

	// Actualiza el subtotal del ítem
	useEffect(() => {
		form.setValue(`items.${index}.subtotal`, subtotal);
	}, [subtotal, form, index, insuranceFee]);

	// Actualiza el total y el peso total
	useEffect(() => {
		const items = form.getValues("items");
		const total = parseFloat(
			items.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0).toFixed(2),
		);
		const totalWeight = parseFloat(
			items.reduce((acc: number, item: any) => acc + (item.weight || 0), 0).toFixed(2),
		);

		form.setValue("total_amount", total);
		form.setValue("total_weight", totalWeight);
	}, [weight, customs, subtotal, form, index, insuranceFee]);

	// Actualiza descripción y fee si cambian los customs
	useEffect(() => {
		if (customs?.description) {
			form.setValue(`items.${index}.description`, customs.description);
			form.setValue(`items.${index}.customs_fee`, customs.fee_in_cents);
		}
	}, [customs?.id, customs?.description, customs?.fee, form, index]);

	const handleRemove = (index: number) => {
		remove(index);
	};

	return (
		<TableRow key={index}>
			<TableCell>{index + 1}</TableCell>
			<TableCell className="w-10">
				<CustomsFeeCombobox index={index} form={form} />
			</TableCell>
			<TableCell className="flex items-center gap-2 ">
				<div className="w-full relative gap-2">
					<Input
						className="lg:w-full pr-40 w-auto"
						{...form.register(`items.${index}.description`)}
					/>
					<div className="absolute right-2 top-1/2 -translate-y-1/2">
						<div className="flex gap-2">
							{form.getValues(`items.${index}.insurance_fee`) > 0 && (
								<Badge variant="outline">
									Seguro: {form.getValues(`items.${index}.insurance_fee`)}
								</Badge>
							)}
							{form.getValues(`items.${index}.charge_fee`) > 0 && (
								<Badge variant="outline" className="">
									Cargo: {form.getValues(`items.${index}.charge_fee`).toFixed(2)}
								</Badge>
							)}
						</div>
					</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<PlusCircle />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							onClick={() => openDialog("charge", index)}
							className="flex items-center gap-2"
						>
							<DollarSign />
							<span>Cargo</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => openDialog("insurance", index)}
							className="flex items-center gap-2"
						>
							<ShieldCheck />
							<span>Seguro</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => openDialog("rate", index)}
							className="flex items-center gap-2"
						>
							<PencilIcon />
							<span>Cambiar Tarifa</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
			<TableCell className="text-right">{(customs?.fee_in_cents / 100 || 0).toFixed(2)}</TableCell>

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
			<TableCell className="text-right">{selectedRate?.public_rate.toFixed(2) || 0}</TableCell>
			<TableCell className="text-right">{subtotal.toFixed(2)}</TableCell>

			<TableCell className="w-10">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => {
						if (index !== 0) {
							handleRemove(index);
						}
					}}
				>
					<Trash2 />
				</Button>
			</TableCell>
		</TableRow>
	);
}

// Memoizar para evitar re-render si las props no cambian
export default React.memo(ItemRow);
