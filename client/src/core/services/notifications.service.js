import { $ } from "../jquery/jquery.lib.js";

class Notifications {
	#timeout;

	constructor() {
		this.#timeout = null;
	}

	/**
	 * Clears the current timeout and sets a new one.
	 * @param {function} callback - The function to call after the timeout duration.
	 * @param {number} duration - The duration of the timeout in milliseconds.
	 */

	#setTimeout(callback, duration) {
		if (this.#timeout) {
			clearTimeout(this.#timeout);
		}

		this.#timeout = setTimeout(callback, duration);
	}

	/**
	 * Shows a notification with the given message.
	 * @param {string} type - The type of notification. Can be "normal", "success" or "error".
	 * @param {string} title - The title of the notification.
	 * @param {string} message - The message to show in the notification.
	 */

	show({ type, title, message }) {
		if (!type) type = "normal";
		if (!title) title = "Notification";
		if (!message) throw new Error("Message is required");

		const notificationBlock = $("div[data-id='notification']");

		const notificationBodyTitle = notificationBlock.find(
			"p[data-id='notification-title']",
		);
		const notificationBodyMessage = notificationBlock.find(
			"p[data-id='notification-message']",
		);

		notificationBodyTitle.text(title);
		notificationBodyMessage.text(message);

		notificationBlock.attr("data-state", "active");
		if (type) notificationBlock.attr("data-notification-type", type);

		// TODO: Кнопка close из шаблон не подключена
		this.#setTimeout(() => {
			notificationBlock.attr("data-state", "inactive");
		}, 5000);
	}
}

export default new Notifications();
