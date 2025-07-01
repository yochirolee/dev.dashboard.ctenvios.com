import { Card, CardContent, CardFooter, CardTitle, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Table, TableRow, TableHead, TableHeader, TableBody, TableCell } from "../ui/table";
import { useProviders } from "@/hooks/use-providers";
import type { Service } from "@/data/types";
import { NewServiceForm } from "./new-service-form";
import { ShareDialog } from "../shares/share-dialog";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
export const ProviderDetails = ({ providerId }: { providerId: number }) => {
	const { data: provider, isPending } = useProviders.getById(providerId ?? 0);
	const [open, setOpen] = useState(false);
	if (isPending)
		return (
			<div className="space-y-4">
				<Skeleton className="h-[200px] w-full" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		);
	return (
		<div className="space-y-4">
			<Card>
				<CardContent>
					<div className="flex items-center gap-4 flex-col lg:flex-row">
						<div className=" bg-muted min-h-24 min-w-24 object-cover rounded-full"></div>
						<div className="flex flex-col gap-2">
							<h1 className="text-2xl font-bold">{provider?.name}</h1>
							<p className="text-sm text-muted-foreground">{provider?.address}</p>
						</div>
						<div className="ml-auto w-full lg:w-fit">
							<Button variant="outline" className="w-full lg:w-fit">
								<Pencil className="w-4 h-4" />
								<span>Editar</span>
							</Button>
						</div>
					</div>
					<Separator className="my-4" />
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-4">
						<span>Contacto: {provider?.contact}</span>
						<span>Teléfono: {provider?.phone}</span>
						<span>Email: {provider?.email}</span>
						<span>Website: {provider?.website}</span>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle>Servicios</CardTitle>
					<ShareDialog
						open={open}
						setOpen={setOpen}
						expanded={true}
						title="Agregar Servicio"
						description={`Agrega un nuevo servicio para  ${provider?.name}`}
						action="Agregar"
						children={<NewServiceForm setOpen={setOpen} provider={provider} />}
					/>
				</CardHeader>
				<div className="flex flex-col w-full gap-2 ">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead>Tipo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{provider?.services.map((service: Service) => (
								<TableRow key={service.id}>
									<TableCell>{service.name}</TableCell>
									<TableCell>{service.description}</TableCell>
									<TableCell>{service.service_type}</TableCell>
									<TableCell>
										<Switch checked={service.is_active} onCheckedChange={() => {}} />
									</TableCell>
									<TableCell className="flex justify-end">
										<Button variant="outline">Editar</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
};
