import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CogIcon, Plane, Ship } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useServices } from "@/hooks/use-services";
import { Skeleton } from "../ui/skeleton";

// Extended Service interface to match API response
interface Service {
	id: number;
	name: string;
	service_type: "AIR" | "MARITIME";
	provider: {
		id: number;
		name: string;
	};
	forwarder: {
		id: number;
		name: string;
	};
}

export function ServiceSelector() {
	const session = useAppStore((state) => state.session);

	const agencyId = session?.user?.agency_id;
	const { data: services, isLoading: isLoadingServices } = useServices.getByAgencyId(agencyId);

	//fecth

	console.log(services, "services");

	const { setSelectedService, selectedService, selectedCustomer, selectedReceiver } =
		useInvoiceStore(
			useShallow((state) => ({
				setSelectedService: state.setSelectedService,
				selectedService: state.selectedService,
				selectedCustomer: state.selectedCustomer,
				selectedReceiver: state.selectedReceiver,
			})),
		);

	const isDisabled = !selectedCustomer || !selectedReceiver;

	const handleServiceChange = (serviceId: string) => {
		const service = services?.find((s: Service) => s.id.toString() === serviceId);
		if (service) {
			setSelectedService(service);
		}
	};

	return (
		<>
			{isLoadingServices ? (
				<Skeleton className="w-full h-1/4 rounded-lg grid items-center justify-center">
					<div className="flex items-center gap-2">
						<CogIcon size={20} className="animate-spin" /> Loading...
					</div>
				</Skeleton>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Seleccionar Servicio Tarifa</CardTitle>
						<CardDescription>
							Selecciona el servicio y tarifa que deseas usar en tu orden.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<RadioGroup
							value={selectedService?.id?.toString() || ""}
							onValueChange={handleServiceChange}
							className="flex w-full"
							disabled={isDisabled}
						>
							{services?.map((service: Service) => (
								<Label
									key={service.id}
									htmlFor={service.id.toString()}
									className={`flex items-start gap-3 rounded-lg border p-3 ${
										isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
									} ${selectedService?.id === service.id ? "border-ring bg-input/20" : ""}`}
								>
									<RadioGroupItem
										value={service.id.toString()}
										id={service.id.toString()}
										className="mt-0.5"
										disabled={isDisabled}
									/>
									<div className="grid grid-cols-2 w-full justify-between items-center gap-2">
										<div className="flex flex-col gap-2">
											<div
												className={`font-medium ${
													selectedService?.id === service.id
														? "text-accent-foreground	"
														: "text-muted-foreground"
												}`}
											>
												{service.name}
											</div>
											<div className="font-small text-muted-foreground">
												{service.provider.name}
											</div>
											<div
												className={`text-lg font-semibold ${
													selectedService?.id === service.id
														? "text-accent-foreground	"
														: " text-muted-foreground"
												}`}
											></div>
										</div>
										<div
											className={`flex justify-end ${
												selectedService?.id === service.id
													? "text-accent-foreground	"
													: "text-muted-foreground"
											}`}
										>
											{service.service_type === "AIR" ? <Plane size={24} /> : <Ship size={24} />}
										</div>
									</div>
								</Label>
							))}
						</RadioGroup>
					</CardContent>
				</Card>
			)}
		</>
	);
}
