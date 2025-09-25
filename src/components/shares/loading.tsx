import { CogIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export const Loading = () => {
	return (
		<Skeleton className="w-full h-1/4 rounded-lg grid items-center justify-center">
			<div className="flex items-center gap-2">
				<CogIcon size={20} className="animate-spin" /> Loading...
			</div>
		</Skeleton>
	);
};
