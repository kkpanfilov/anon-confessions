import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./feed.module.scss";
import template from "./feed.template.html";

export class Feed extends BaseScreen {
	constructor() {
		super({
			title: "Feed",
		});
	}

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);
		return htmlElement;
	}
}
