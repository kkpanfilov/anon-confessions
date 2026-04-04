import { FetchQuery } from "@/core/fetch-query/fetch-query.lib.js";

import NotificationsService from "@/core/services/notifications.service.js";

export class ConfessionsService {
	#BASE_URL = `/confessions`;

	constructor() {
		this.notificationService = NotificationsService;
	}

	async getLatestConfessions() {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/latest`,
			method: "GET",
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Something went wrong",
			});
		}

		return data;
	}
}
