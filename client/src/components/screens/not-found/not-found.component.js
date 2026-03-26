import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./not-found.module.scss";
import template from "./not-found.template.html";

export class NotFound extends BaseScreen {
	constructor() {
		super({
			title: "404",
		});
	}

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);
		return htmlElement;
	}
}
