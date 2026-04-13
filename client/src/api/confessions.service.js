import { FetchQuery } from "@/core/fetch-query/fetch-query.lib.js";

import NotificationsService from "@/core/services/notifications.service.js";
import ValidationService from "@/core/services/validation.service.js";

export class ConfessionsService {
	#BASE_URL = `/confessions`;

	constructor() {
		this.notificationService = NotificationsService;
		this.validationService = ValidationService;

		this.confessionSchema = {
			title: {
				isRequired: true,
				type: "string",
				minLength: 1,
				maxLength: 32,
			},
			content: {
				isRequired: true,
				type: "string",
				minLength: 1,
				maxLength: 500,
			},
		};
	}

	#validateId(id) {
		if (!id) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Confession ID is required",
			});

			return false;
		}

		id = id.trim();

		const isUUID = this.validationService.validateUuid(id);

		if (!isUUID) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Confession ID is invalid",
			});

			return false;
		}

		return true;
	}

	#validateBody(body, schema = this.confessionSchema) {
		if (!body) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Confession body is required",
			});

			return false;
		}

		const isBodyObject = this.validationService.validateObject(body);

		if (!isBodyObject) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Confession body is invalid",
			});

			return false;
		}

		if (!this.validationService.validateObject(schema)) {
			this.notificationService.show({
				type: "error",
				title: "Error",
				message: "Confession validation schema is invalid",
			});

			return false;
		}

		for (const [fieldName, fieldSchema] of Object.entries(schema)) {
			const value = body[fieldName];
			const isRequired = fieldSchema?.isRequired === true;

			if (isRequired && !this.validationService.validateRequired(value)) {
				this.notificationService.show({
					type: "error",
					title: "Error",
					message: `Confession ${fieldName} is required`,
				});

				return false;
			}

			if (!this.validationService.validateRequired(value)) {
				continue;
			}

			if (fieldSchema?.type === "string") {
				if (!this.validationService.validateString(value)) {
					this.notificationService.show({
						type: "error",
						title: "Error",
						message: `Confession ${fieldName} must be a string`,
					});

					return false;
				}

				if (
					typeof fieldSchema.minLength === "number" &&
					!this.validationService.validateMinLength(
						value,
						fieldSchema.minLength,
					)
				) {
					this.notificationService.show({
						type: "error",
						title: "Error",
						message: `Confession ${fieldName} must be at least ${fieldSchema.minLength} characters`,
					});

					return false;
				}

				if (
					typeof fieldSchema.maxLength === "number" &&
					!this.validationService.validateMaxLength(
						value,
						fieldSchema.maxLength,
					)
				) {
					this.notificationService.show({
						type: "error",
						title: "Error",
						message: `Confession ${fieldName} must be at most ${fieldSchema.maxLength} characters`,
					});

					return false;
				}
			}
		}

		return true;
	}

	#validateOkResponse(response, funcName) {
		if (!response.ok) {
			console.log(response);

			this.notificationService.show({
				type: "error",
				title: "Error",
				message: `Function ${funcName} failed`,
			});

			return false;
		}

		return true;
	}

	async getRandomConfessions() {
		const result = await FetchQuery({
			path: `${this.#BASE_URL}/random`,
			method: "GET",
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.getRandomConfessions.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async getConfessionById(id) {
		const isValidId = this.#validateId(id);

		if (!isValidId) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "GET",
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.getConfessionById.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async createConfession(body) {
		const isValidBody = this.#validateBody(body);

		if (!isValidBody) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/`,
			method: "POST",
			body,
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.createConfession.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async updateConfession(id, body) {
		const isValidId = this.#validateId(id);

		if (!isValidId) return false;

		const isValidBody = this.#validateBody(body);

		if (!isValidBody) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "PATCH",
			body: {
				...body,
			},
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.updateConfession.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async deleteConfession(id, ownerToken) {
		const isValidId = this.#validateId(id);

		if (!isValidId) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}`,
			method: "DELETE",
			body: { ownerToken },
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.deleteConfession.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async likeConfession(id) {
		const isValidId = this.#validateId(id);

		if (!isValidId) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}/like`,
			method: "PATCH",
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.likeConfession.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}

	async unlikeConfession(id) {
		const isValidId = this.#validateId(id);

		if (!isValidId) return false;

		const result = await FetchQuery({
			path: `${this.#BASE_URL}/${id}/unlike`,
			method: "PATCH",
		});

		const isValidResult = this.#validateOkResponse(
			result,
			this.unlikeConfession.name,
		);

		if (!isValidResult) return false;

		return result.data;
	}
}
