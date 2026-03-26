import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./confession.module.scss";
import template from "./confession.template.html";

export class Confession extends BaseScreen {
	constructor() {
		super({
			title: "Confession",
		});
	}

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);
		return htmlElement;
	}
}
