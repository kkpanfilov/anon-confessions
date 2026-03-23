import { Feed } from "@/components/screens/feed/feed.component.js";
import { Add } from "@/components/screens/add/add.component.js";
import { Confession } from "@/components/screens/confession/confession.component.js";

export const ROUTES = [
	{
		path: "/feed",
		component: Feed,
	},
	{
		path: "/add",
		component: Add,
	},
	{
		path: "/confession/:id",
		component: Confession,
	},
];
