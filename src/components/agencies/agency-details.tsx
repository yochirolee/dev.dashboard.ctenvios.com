import { useAgencies } from "@/hooks/use-agencies";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Pencil } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export const AgencyDetails = ({ agencyId }: { agencyId: number }) => {
	const { data: agency, isLoading } = useAgencies.getById(agencyId ?? 0);
	if (isLoading) return <Skeleton className="h-[200px] w-full" />;
	return (
		<Card>
			<CardContent>
				<div className="flex flex-col lg:flex-row items-center gap-4">
					<div className=" bg-muted min-h-24 min-w-24 object-cover rounded-full"></div>
					<div className="flex flex-col gap-2 w-full">
						<h1 className="text-2xl font-bold">{agency?.name}</h1>
						<p className="text-sm text-muted-foreground">{agency?.address}</p>
					</div>
					<div className="ml-auto w-full lg:w-fit">
						<Button variant="outline" className="gap-2 w-full lg:w-fit">
							<Pencil className="w-4 h-4" />
							<span>Editar</span>
						</Button>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-4">
					<span>Contacto: {agency?.contact}</span>
					<span>Teléfono: {agency?.phone}</span>
					<span>Email: {agency?.email}</span>
					<span>Website: {agency?.website}</span>
				</div>
			</CardContent>
		</Card>
	);
};
