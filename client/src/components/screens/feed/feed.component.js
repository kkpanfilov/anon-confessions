import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./feed.module.scss";
import template from "./feed.template.html";

import ConfessionItem from "@/components/ui/confession-item/confession-item.component.js";

export class Feed extends BaseScreen {
	constructor() {
		super({
			title: "Feed",
		});
	}

	render() {
		const confessionItem = new ConfessionItem().render();

		const htmlElement = renderService.htmlToElement(
			template,
			{ confession: confessionItem },
			styles,
		);
		return htmlElement;
	}
}
