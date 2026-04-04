import { $ } from "@/core/jquery/jquery.lib.js";

import ChildComponent from "@/core/component/child.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./confession-item.module.scss";
import template from "./confession-item.template.html";
import { timeAgo } from "@/utils/timeAgo.js";

export default class ConfessionItem extends ChildComponent {
	constructor(confession) {
		super();

		this.id = confession.id;
		this.createdAt = Math.round(
			new Date(confession.createdAt).getTime() / 1000,
		);
		this.content = confession.content;
		this.likes = confession.likes;
	}

	render() {
		this.element = renderService.htmlToElement(template, [], styles);

		console.log(this);
		$(this.element).attr("href", `/confession/${this.id}`);
		$(this.element)
			.find('div[data-id="confession-content"]')
			.text(this.content);
		$(this.element)
			.find('span[data-id="confession-likes"]')
			.text(String(this.likes));
		$(this.element)
			.find('span[data-id="confession-time"]')
			.text(timeAgo(this.createdAt));

		return this.element;
	}
}
