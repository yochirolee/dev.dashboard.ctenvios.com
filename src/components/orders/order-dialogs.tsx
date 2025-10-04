import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "../ui/select";

export const InsuranceFeeDialog = ({
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
	console.log("order-dialogs");
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
					{...form.register(`items.${index}.insurance_fee_in_cents`, {
						valueAsNumber: true,
					})}
					type="number"
					onChange={(e) => {
						form.setValue(`items.${index}.insurance_fee_in_cents`, parseFloat(e.target.value));
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

export const ChargeDialog = ({
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
					<AlertDialogTitle>Adicionar Cargo</AlertDialogTitle>
					<AlertDialogDescription>Adiciona un cargo a este item.</AlertDialogDescription>
				</AlertDialogHeader>

				<Input
					{...form.register(`items.${index}.charge_fee_in_cents`, {
						valueAsNumber: true,
					})}
					type="number"
					onChange={(e) => {
						form.setValue(`items.${index}.charge_fee_in_cents`, parseFloat(e.target.value));
					}}
					placeholder="Cargo"
				/>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction>Adicionar</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export const ChangeRateDialog = ({
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
					<AlertDialogTitle>Cambiar Tarifa</AlertDialogTitle>
					<AlertDialogDescription>Cambia la tarifa de este item.</AlertDialogDescription>
				</AlertDialogHeader>

				<Input
					{...form.register(`items.${index}.rate`, {
						valueAsNumber: true,
					})}
					type="number"
					onChange={(e) => {
						form.setValue(`items.${index}.rate`, parseFloat(e.target.value));
					}}
					placeholder="Tarifa"
				/>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction>Cambiar</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const discountOptions = [
	{ label: "cash", value: "cash" },
	{ label: "percent", value: "percent" },
	{ label: "rate", value: "rate" },
];

export const DiscountDialog = ({
	open,
	setOpen,
	form,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	form: any;
}) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Descuento</AlertDialogTitle>
					<AlertDialogDescription>Agrega un descuento a la factura.</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex flex-col gap-2">
					<Select
						{...form.register(`discount_type`, {
							valueAsNumber: true,
						})}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Tipo de Descuento" />
						</SelectTrigger>
						<SelectContent>
							{discountOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						{...form.register(`discount_amount`, {
							valueAsNumber: true,
						})}
						type="number"
						onChange={(e) => {
							form.setValue(`discount_amount`, parseFloat(e.target.value));
						}}
						placeholder="Descuento"
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction>Adicionar</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
