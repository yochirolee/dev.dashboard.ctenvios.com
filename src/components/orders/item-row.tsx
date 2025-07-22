import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";

import { Badge } from "../ui/badge";

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
	const insuranceFee = useWatch({
		control: form.control,
		name: `items.${index}.insurance_fee`,
	});
	const subtotal = useMemo(() => {
		if (parseFloat(weight) > 100) {
			form.setValue(`items.${index}.delivery_fee`, 30);
		} else {
			form.setValue(`items.${index}.delivery_fee`, 0);
		}
		const subtotal = parseFloat(
			(
				(weight || 0) * (selectedRate?.public_rate || 0) +
				(customs?.fee || 0) +
				(parseFloat(insuranceFee) || 0) +
				(parseFloat(form.getValues(`items.${index}.delivery_fee`)) || 0)
			).toFixed(2),
		);

		return subtotal;
	}, [weight, selectedRate?.public_rate, customs?.fee, insuranceFee]);

	const [openInsuranceFeeDialog, setOpenInsuranceFeeDialog] = useState(false);

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
			form.setValue(`items.${index}.customs_fee`, customs.fee);
		}
	}, [customs?.id, customs?.description, customs?.fee, form, index]);

	return (
		<TableRow key={index}>
			<TableCell>{index + 1}</TableCell>
			<TableCell className="w-10">
				<CustomsFeeCombobox index={index} form={form} />
			</TableCell>
			<TableCell className="flex items-center gap-2 ">
				<div className="w-full relative gap-2">
					<Input className="w-full" {...form.register(`items.${index}.description`)} />
					<div className="absolute right-2 top-1/2 -translate-y-1/2">
						<div className="flex gap-2">
							{form.getValues(`items.${index}.insurance_fee`) > 0 && (
								<Badge variant="outline">
									Seguro: {form.getValues(`items.${index}.insurance_fee`)}
								</Badge>
							)}
							{form.getValues(`items.${index}.delivery_fee`) > 0 && (
								<Badge variant="outline">
									Envio: {form.getValues(`items.${index}.delivery_fee`)}
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
						<DropdownMenuItem className="flex items-center gap-2">
							<DollarSign />
							<span>Cargo</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setOpenInsuranceFeeDialog(true)}
							className="flex items-center gap-2"
						>
							<ShieldCheck />
							<span>Seguro</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
				<Button variant="ghost" size="icon" onClick={() => remove(index)}>
					<Trash2 />
				</Button>
			</TableCell>
			<InsuranceFeeDialog
				open={openInsuranceFeeDialog}
				setOpen={setOpenInsuranceFeeDialog}
				form={form}
				index={index}
			/>
		</TableRow>
	);
}

// Memoizar para evitar re-render si las props no cambian
export default React.memo(ItemRow);

const InsuranceFeeDialog = ({
	open,
	setOpen,
	index,
	form,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	index: number;
	form: any;
}) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<Input
					{...form.register(`items.${index}.insurance_fee`, {
						valueAsNumber: true,
					})}
					type="number"
					onChange={(e) => {
						form.setValue(`items.${index}.insurance_fee`, parseFloat(e.target.value));
					}}
					placeholder="Insurance fee"
				/>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
