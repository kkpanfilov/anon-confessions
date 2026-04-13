import { FetchQuery } from "@/core/fetch-query/fetch-query.lib.js";

import NotificationsService from "@/core/services/notifications.service.js";

export class ConfessionsService {
	#BASE_URL = `/confessions`;

	constructor() {
		this.notificationService = NotificationsService;
	}

	// TODO: Сервис дублирует одинаковую обработку ошибок почти в каждом методе и возвращает undefined как "неуспех". Лучше централизовать контракт, иначе UI-компоненты регулярно падают на result.id/list.length.
	async getRandomConfessions() {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/random`,
			method: "GET",
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to get random confessions",
			});
		}

		return data;
	}

	async getConfessionById(id) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "GET",
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to get confession",
			});
		}

		return data;
	}

	async createConfession(body) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/`,
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

	async updateConfession(id, body, ownerToken) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "PATCH",
			body: {
				...body,
				ownerToken,
			},
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to edit confession",
			});
		}

		return data;
	}

	async deleteConfession(id, ownerToken) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "DELETE",
			body: { ownerToken },
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to delete confession",
			});
		}

		return data;
	}

	async likeConfession(id) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}/like`,
			method: "PATCH",
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to like confession",
			});
		}

		return data;
	}

	async unlikeConfession(id) {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}/unlike`,
			method: "PATCH",
		});

		const data = result.data;

		if (!data) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Failed to unlike confession",
			});
		}

		return data;
	}
}
