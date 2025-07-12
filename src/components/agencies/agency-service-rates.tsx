import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgencies } from "@/hooks/use-agencies";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { AgencyRates } from "./agency-rates";
import { Skeleton } from "../ui/skeleton";
import { AgenciesRatesForm } from "./agencies-rates-form";
import { ShareDialog } from "../shares/share-dialog";
import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";

export default function AgencyServiceRates({ agencyId }: { agencyId: number }) {
	const { data: services, isLoading } = useAgencies.getServices(agencyId);
	const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({});

	const handleDialogOpen = (serviceId: number, open: boolean): void => {
		setOpenDialogs((prev) => ({
			...prev,
			[serviceId]: open,
		}));
	};

	if (isLoading) return <Skeleton className="h-[200px] w-full" />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Servicios y Tarifas</CardTitle>
				<CardDescription>
					Aquí puedes ver los servicios y tarifas de la agencia. Puedes editar las tarifas de los
					servicios.
				</CardDescription>
			</CardHeader>
			<Separator />
			<CardContent className="space-y-2 lg:space-y-4 m-0 p-2 lg:p-4">
				{services?.map((service: any) => (
					<div
						key={service?.id}
						className="flex flex-col p-4 rounded-lg  lg:p-4 my-2 lg:my-4 bg-black/20"
					>
						<div className="flex flex-col lg:flex-row justify-between items-center">
							<div className="flex flex-col">
								<div className="flex items-center space-x-4">
									<h1 className="text-lg font-bold">{service?.provider?.name}</h1>
									<Badge variant="outline">{service?.service_type}</Badge>
								</div>
								<div className="flex justify-between items-center gap-2">
									<p className="text-sm text-muted-foreground">{service?.description}</p>
								</div>
							</div>
							<ShareDialog
								key={`dialog-${service.id}`}
								title="Crear Tarifa"
								description="Crear una nueva tarifa para el servicio"
								mode="create"
								open={openDialogs[service.id] || false}
								setOpen={(open) => handleDialogOpen(service.id, open)}
							>
								<AgenciesRatesForm
									key={`form-${service.id}`}
									rate={{
										agency_id: agencyId,
										service_id: service.id,
									}}
									setOpen={(open) => handleDialogOpen(service.id, open)}
									mode="create"
								/>
							</ShareDialog>
						</div>
						{service?.rates?.length > 0 && (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nombre</TableHead>
										<TableHead>Costo Agencia</TableHead>
										<TableHead>Venta al Público</TableHead>
										<TableHead>Profit</TableHead>
										<TableHead className="w-10 text-right"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{service?.rates?.map((rate: any) => (
										<AgencyRates key={rate.id} rate={rate} />
									))}
								</TableBody>
							</Table>
						)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
