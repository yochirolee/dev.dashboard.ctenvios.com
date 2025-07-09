import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { type Rate } from "@/data/types";
import { useRates } from "@/hooks/use-rates";

export function ServiceSelector() {
	const { data: rates } = useRates.getByAgencyId(1);

	console.log(rates, "rates");

	const { setSelectedRate, selectedRate } = useInvoiceStore(
		useShallow((state) => ({
			setSelectedRate: state.setSelectedRate,
			selectedRate: state.selectedRate,
		})),
	);
	// Memoize the active rate calculation

	return (
		<Card>
			<CardHeader>
				<CardTitle>Seleccionar Servicio Tarifa</CardTitle>
				<CardDescription>
					Selecciona el servicio y tarifa que deseas usar en tu orden.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex gap-4">
				{rates?.map((rate: Rate) => (
					<Button
						key={rate.id}
						type="button"
						className={`${
							selectedRate?.id === rate.id ? "ring" : "opacity-50"
						} h-40 w-40 flex flex-col items-center justify-center`}
						variant="outline"
						onClick={() => setSelectedRate(rate)}
					>
						<div className="flex flex-col items-center justify-center">
							<h2 className=" text-muted-foreground text-lg">{rate?.name}</h2>
							<h2 className="text-sm text-muted-foreground">{rate?.service?.provider.name}</h2>
							<span className="text-sm text-muted-foreground">{rate.public_rate} USD</span>
						</div>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
