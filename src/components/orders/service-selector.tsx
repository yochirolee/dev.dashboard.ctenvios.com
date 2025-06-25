import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { useAgencies } from "@/hooks/use-agencies";
import { type Rate } from "@/data/types";

interface Service {
	id: number;
	name: string;
	description: string;
	service_type: string;
	rates: Rate[];
}

export function ServiceSelector() {
	const { data: services } = useAgencies.getServices(1);

	console.log("services", services);
	const { selectedService, setSelectedService } = useInvoiceStore(
		useShallow((state) => ({
			selectedService: state.selectedService,
			setSelectedService: state.setSelectedService,
			selectedRate: state.selectedRate,
		})),
	);
	// Memoize the active rate calculation

	return (
		<Card>
			<CardHeader>
				<CardTitle>Seleccionar Servicio</CardTitle>
				<CardDescription>Selecciona el servicio que deseas agregar a tu orden.</CardDescription>
			</CardHeader>
			<CardContent className="grid grid-cols-6 gap-4 items-center">
				{services?.map((service: Service) => (
					<Button
						key={service.id}
						type="button"
						variant="outline"
						onClick={() => setSelectedService(service)}
						className={`${
							selectedService?.id === service.id ? "ring" : "opacity-50"
						} h-25 flex flex-col items-center justify-center`}
					>
						<span>{service.name}</span>
						<span className="text-sm text-muted-foreground">{service.description}</span>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
