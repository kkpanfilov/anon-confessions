import renderService from "@/core/services/render.service.js";

import Header from "./header/header.component.js";
import Notification from "./notification/notification.component.js";

import styles from "./layout.module.scss";
import template from "./layout.template.html";

export class Layout {
	// #router;
	#children;

	constructor({ router, children }) {
		// this.#router = router;
		this.#children = children;
	}

	render() {
		const header = new Header().render();
		const notification = new Notification().render();

		const htmlElement = renderService.htmlToElement(
			template,
			{ header, children: this.#children, notification },
			styles,
		);
		return htmlElement;
	}
}
