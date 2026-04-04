import { BaseScreen } from "@/core/component/base-screen.component.js";
import ConfessionItem from "@/components/screens/feed/confession-item/confession-item.component.js";

import renderService from "@/core/services/render.service.js";

import { ConfessionsService } from "@/api/confessions.service.js";

import { $ } from "@/core/jquery/jquery.lib.js";

import styles from "./feed.module.scss";
import template from "./feed.template.html";

export class Feed extends BaseScreen {
	constructor() {
		super({
			title: "Feed",
		});
		this.confessionService = new ConfessionsService();
	}

	render() {
		const htmlElement = renderService.htmlToElement(template, {}, styles);

		const feedList = $(htmlElement).find("div[data-id='feed-list']");

		feedList.clear();

		this.confessionService
			.getLatestConfessions()
			.then((list) => {
				list.forEach(confession => {
					const confessionClone = new ConfessionItem(confession).render();
					feedList.append(confessionClone);
				});
			});

		return htmlElement;
	}
}
