import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgencies } from "@/hooks/use-agencies";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { AgencyRates } from "./agency-rates";
import { Skeleton } from "../ui/skeleton";

export default function AgencyServiceRates({ agencyId }: { agencyId: number }) {
	const { data: serviceRates, isLoading } = useAgencies.getServices(agencyId);
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
				{serviceRates?.map((service: any) => (
					<div
						key={service?.id}
						className="flex flex-col p-4 rounded-lg  lg:p-4 my-2 lg:my-4 bg-black/20"
					>
						<div className="flex items-center space-x-4">
							<h1 className="text-lg font-bold">{service?.provider?.name}</h1>
							<Badge variant="outline">{service?.service_type}</Badge>
						</div>
						<div className="flex justify-between items-center gap-2">
							<p className="text-sm text-muted-foreground">{service?.description}</p>
						</div>
						<div>
							{service?.rates?.map((rate: any) => (
								<AgencyRates key={rate.id} rate={rate} />
							))}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
