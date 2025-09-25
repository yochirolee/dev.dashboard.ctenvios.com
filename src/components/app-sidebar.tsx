import * as React from "react";
import {
	AudioWaveform,
	BoxIcon,
	Command,
	FileBox,
	GalleryVerticalEnd,
	HomeIcon,
	Settings2,
	Sparkles,
	Warehouse,
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
import { NavMarketplace } from "./nav-marketplace";
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
					url: "/orders/list",
				},
			],
		},
		{
			title: "Logistica",
			url: "#",
			icon: Warehouse,
			items: [
				{
					title: "Despachos",
					url: "/logistics/dispatch",
				},
				{
					title: "Contenedores",
					url: "/logistics/containers",
				},
				{
					title: "Vuelos",
					url: "/logistics/flights",
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
					title: "Receivers",
					url: "/settings/receivers",
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

	marketplace: [
		{
			title: "Sales",
			url: "#",
			icon: Sparkles,

			items: [
				{
					title: "Crear Orden",
					url: "/orders/new",
				},
				{
					title: "Ordenes",
					url: "/orders/list",
				},
			],
		},
		{
			title: "Manage Products",
			url: "#",
			icon: BoxIcon,
			items: [
				{
					title: "Providers",
					url: "/settings/providers",
				},
				{
					title: "Agencies",
					url: "/settings/agencies",
				},
			],
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
				<NavMarketplace items={data.marketplace} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
