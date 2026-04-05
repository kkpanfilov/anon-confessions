import { SERVER_URL } from "@/config/url.config.js";

import { extractMessageError } from "./extract-message-error.js";

import NotificationsService from "../services/notifications.service.js";

/**
 * FetchQuery is a minimalistic library for handling API requests.
 * Fetch data from the API with provided options.
 *
 * @param {Object} options - Configuration options for the API request.
 * @param {string} options.path - The API endpoint path.
 * @param {('GET'|'POST'|'PATCH'|'DELETE'|'PUT')} [options.method='GET'] - The HTTP method to use for the request.
 * @param {Object} [options.body=null] - The request payload to send as JSON.
 * @param {Object} [options.headers={}] - Additional headers to include with the request.
 * @param {Function} [options.onSuccess=null] - Callback function to be called on successful response.
 * @param {Function} [options.onError=null] - Callback function to be called on error response.
 * @returns {Promise<{isLoading: boolean, error: string|null, data: any|null}>} - An object containing the loading state, error, and data from the response.
 */

export async function FetchQuery({
	path,
	method = "GET",
	body = null,
	headers = {},
	onSuccess = null,
	onError = null,
}) {
	let isLoading = true;
	let error = null;
	let data = null;

	const url = `${SERVER_URL}/api${path}`;

	const requestOptions = {
		method,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	};

	if (body) {
		requestOptions.body = JSON.stringify(body);
	}

	const notificationService = NotificationsService;

	try {
		const response = await fetch(url, requestOptions);

		if (response.ok) {
			data = await response.json();

			if (onSuccess) onSuccess(data);
		} else {
			const errorData = await response.json();
			const errorMessage = extractMessageError(errorData);

			if (onError) onError(errorMessage);

			notificationService.show({
				type: "error",
				title: "Error",
				message: errorMessage,
			});
		}
	} catch (errorData) {
		const errorMessage = extractMessageError(errorData);

		if (onError) onError(errorMessage);

		notificationService.show({
			type: "error",
			title: "Error",
			message: errorMessage,
		});
	} finally {
		isLoading = false;
	}

	return { isLoading, error, data };
}
