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
				message: "Failed to get latest confessions",
			});
		}

		return data;
	}

	async createConfession(body) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/create`,
			method: "POST",
			body,
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to create confession",
			});
		}

		return data;
	}
}
