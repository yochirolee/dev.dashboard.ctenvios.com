import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { type Rate } from "@/data/types";
import { useRates } from "@/hooks/use-rates";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plane, Ship } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

// Extended Rate interface to match API response
interface ExtendedRate extends Rate {
	name: string;
	service: {
		id: number;
		name: string;
		service_type: "AIR" | "MARITIME";
		provider: {
			id: number;
			name: string;
		};
	};
}

export function ServiceSelector() {
	const session = useAppStore((state) => state.session);
	const agencyId = session?.user?.agency_id;
	const { data: rates } = useRates.getByAgencyId(agencyId);

	

	const { setSelectedRate, selectedRate } = useInvoiceStore(
		useShallow((state) => ({
			setSelectedRate: state.setSelectedRate,
			selectedRate: state.selectedRate,
		})),
	);

	const handleRateChange = (rateId: string) => {
		const rate = rates?.find((r: ExtendedRate) => r.id.toString() === rateId);
		if (rate) {
			setSelectedRate(rate);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Seleccionar Servicio Tarifa</CardTitle>
				<CardDescription>
					Selecciona el servicio y tarifa que deseas usar en tu orden.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex gap-4">
				<RadioGroup
					value={selectedRate?.id?.toString() || ""}
					onValueChange={handleRateChange}
					className="flex w-full"
				>
					{rates?.map((rate: ExtendedRate) => (
						<Label
							key={rate.id}
							htmlFor={rate.id.toString()}
							className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${
								selectedRate?.id === rate.id ? "border-ring bg-input/20" : ""
							}`}
						>
							<RadioGroupItem
								value={rate.id.toString()}
								id={rate.id.toString()}
								className="mt-0.5"
							/>
							<div className="grid grid-cols-2 w-full justify-between items-center gap-2">
								<div className="flex flex-col gap-2">
									<div
										className={`font-medium ${
											selectedRate?.id === rate.id
												? "text-accent-foreground	"
												: "text-muted-foreground"
										}`}
									>
										{rate.name}
									</div>
									<div className="font-small text-muted-foreground">
										{rate.service.provider.name}
									</div>
									<div
										className={`text-lg font-semibold ${
											selectedRate?.id === rate.id ? "text-accent-foreground	" : " text-muted-foreground"
										}`}
									>
										{rate.public_rate} USD
									</div>
								</div>
								<div
									className={`flex justify-end ${
										selectedRate?.id === rate.id
											? "text-accent-foreground	"
											: "text-muted-foreground"
									}`}
								>
									{rate.service.service_type === "AIR" ? <Plane size={24} /> : <Ship size={24} />}
								</div>
							</div>
						</Label>
					))}
				</RadioGroup>
			</CardContent>
		</Card>
	);
}
