import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import type { Agency } from "@/data/types";
import { EditAgencyForm } from "./edit-agency-form";
import { NewAgencyDialog } from "./new-agency-dialog";
import { useState } from "react";
import { Badge } from "../ui/badge";
import ImageUploadForm from "../upload/ImageUploadForm";

export const AgencyDetails = ({
	selectedAgency,
	setSelectedAgency,
}: {
	selectedAgency: Agency;
	setSelectedAgency: (agency: Agency) => void;
}) => {
	const [openEdit, setOpenEdit] = useState(false);
	if (!selectedAgency) return <Skeleton className="h-[200px] w-full" />;
	return (
		<Card>
			<CardContent>
				<div className="flex flex-col lg:flex-row items-center gap-4">
					{selectedAgency?.logo ? (
						<img
							src={selectedAgency?.logo}
							alt={selectedAgency?.name}
							className="w-20 h-20  object-center object-scale-down rounded-full border  "
						/>
					) : (
						<ImageUploadForm
							onChange={() => {}}
							label="Seleccionar imagen"
							defaultImage={selectedAgency?.logo}
						/>
					)}

					<div className="flex flex-col gap-2 w-full">
						<h1 className="text-2xl font-bold">{selectedAgency?.name}</h1>
						<Badge variant="outline">{selectedAgency?.agency_type?.toUpperCase()}</Badge>

						<p className="text-sm text-muted-foreground">{selectedAgency?.address}</p>
					</div>
					<div className="ml-auto w-full lg:w-fit">
						<NewAgencyDialog
							title="Editar Agencia"
							description="Editar la agencia"
							action="Editar Agencia"
							open={openEdit}
							setOpen={setOpenEdit}
						>
							<EditAgencyForm
								setOpen={setOpenEdit}
								selectedAgency={selectedAgency}
								setSelectedAgency={setSelectedAgency}
							/>
						</NewAgencyDialog>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-4">
					<span>Contacto: {selectedAgency?.contact}</span>
					<span>Teléfono: {selectedAgency?.phone}</span>
					<span>Email: {selectedAgency?.email}</span>
					<span>Website: {selectedAgency?.website}</span>
				</div>
			</CardContent>
		</Card>
	);
};
