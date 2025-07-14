import * as React from "react";
import {
	AudioWaveform,
	Command,
	FileBox,
	Frame,
	GalleryVerticalEnd,
	HomeIcon,
	Map,
	PieChart,
	Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useLocation } from "react-router-dom";

// This is sample data.
const data = {
	user: {
		name: "yleecruz",
		email: "yleecruz@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Caribe Travel Express",
			logo: GalleryVerticalEnd,
			plan: "Transitaria",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Agencia",
		},
		{
			name: "CTEnvios.",
			logo: Command,
			plan: "Agencia",
		},
	],
	navMain: [
		{
			title: "Ordenes",
			url: "#",
			icon: FileBox,
			isActive: true,
			items: [
				{
					title: "Crear Orden",
					url: "/orders/new",
				},
				{
					title: "Ordenes",
					url: "/orders",
				},
				{
					title: "Reportes",
					url: "#",
				},
			],
		},

		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{
					title: "Providers",
					url: "/settings/providers",
				},
				{
					title: "Agencies",
					url: "/settings/agencies",
				},
				{
					title: "Customers",
					url: "/settings/customers",
				},
				{
					title: "Receipts",
					url: "/settings/receipts",
				},
				{
					title: "Aranceles",
					url: "/settings/customs",
				},
				{
					title: "Usuarios",
					url: "/settings/users",
				},
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: Frame,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: PieChart,
		},
		{
			name: "Travel",
			url: "#",
			icon: Map,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent className="[scrollbar-color:--alpha(var(--foreground)/20%)_transparent] [scrollbar-width:thin]">
				<Link to="/" className="mx-2">
					<Button
						variant={location.pathname === "/" ? "secondary" : "ghost"}
						className="w-full justify-start "
					>
						<HomeIcon className="mr-2 h-4 w-4" />
						Inicio
					</Button>
				</Link>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
