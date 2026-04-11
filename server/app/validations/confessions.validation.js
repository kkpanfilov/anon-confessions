import { z } from "zod";

export const confessionSchema = {
	body: z.object({
		title: z.string().trim().max(32).default("Anonymous confession"),
		content: z.string().trim().max(500),
	}),
	params: z.object({
		id: z.uuid(),
	}),
};
