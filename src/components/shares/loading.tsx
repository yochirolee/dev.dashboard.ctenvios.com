import { CogIcon } from "lucide-react";

export const Loading = () => {
	return (
		<div className="grid h-full w-full justify-center items-center gap-2">
			<div className="inline-flex gap-2 items-center">
				<CogIcon size={20} className="animate-spin" /> <p>Loading...</p>
			</div>
		</div>
	);
};
