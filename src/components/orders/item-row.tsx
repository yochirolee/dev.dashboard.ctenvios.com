import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

export default function ItemRow({
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
		const subtotal = parseFloat(
			((weight || 0) * (selectedRate?.public_rate || 0) + (customs?.fee || 0)).toFixed(2),
		);
		return subtotal;
	}, [weight, selectedRate, customs?.id]);

	// Update the description field when customs selection changes
	useEffect(() => {
		if (customs?.description) {
			form.setValue(`items.${index}.description`, customs.description);
			form.setValue(`items.${index}.fee`, customs.fee);
		}
	}, [customs?.description, form, index]);

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
			<TableCell className="text-right">{selectedRate?.public_rate}</TableCell>
			<TableCell className="text-right">{subtotal.toFixed(2)}</TableCell>

			<TableCell>
				<Button variant="ghost" size="icon" onClick={() => remove(index)}>
					<Trash2 />
				</Button>
			</TableCell>
		</TableRow>
	);
}
