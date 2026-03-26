import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./add.module.scss";
import template from "./add.template.html";

export class Add extends BaseScreen {
	constructor() {
		super({
			title: "New confession",
		});
	}

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);
		return htmlElement;
	}
}
