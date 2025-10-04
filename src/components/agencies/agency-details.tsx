import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import type { Agency } from "@/data/types";

import { Badge } from "../ui/badge";
import ImageUploadForm from "../upload/ImageUploadForm";
import { Phone, User } from "lucide-react";
import { Mail } from "lucide-react";
import { Globe } from "lucide-react";

export const AgencyDetails = ({ selectedAgency }: { selectedAgency: Agency }) => {
	if (!selectedAgency) return <Skeleton className="h-[200px] w-full" />;
	return (
		<Card>
			<CardContent>
				<div className="flex flex-row items-center gap-4">
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
				</div>
				<Separator className="my-4" />
				<div className="grid grid-cols-2 gap-3 my-4 text-sm">
					{selectedAgency?.contact && <span className="flex items-center gap-2"><User size={16} className="text-muted-foreground" />  {selectedAgency?.contact}</span>}
					{selectedAgency?.phone && <span className="flex items-center gap-2"><Phone size={16} className="text-muted-foreground" /> {selectedAgency?.phone}</span>}
					{selectedAgency?.email && <span className="flex items-center gap-2"><Mail size={16} className="text-muted-foreground" />  {selectedAgency?.email}</span>}
				{selectedAgency?.website && <span className="flex items-center gap-2"><Globe size={16} className="text-muted-foreground" /> {selectedAgency?.website}</span>}
				</div>
			</CardContent>
		</Card>
	);
};
