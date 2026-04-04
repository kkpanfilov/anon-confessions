import { BaseScreen } from "@/core/component/base-screen.component.js";

import formService from "@/core/services/form.service.js";
import renderService from "@/core/services/render.service.js";
import notificationsService from "@/core/services/notifications.service.js";

import { $ } from "@/core/jquery/jquery.lib.js";

import styles from "./add.module.scss";
import template from "./add.template.html";

export class Add extends BaseScreen {
	constructor() {
		super({
			title: "New confession",
		});
	}

	#handleSubmit = event => {
		const data = formService.getFormData(event.target);

		if (!data.content) {
			notificationsService.show({
				type: "error",
				title: "Error",
				message: "Content is required",
			});
			return;
		}

		
	};

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);

		const textarea = $(htmlElement).find('textarea[name="content"]');
		const counter = $(htmlElement).find('span[data-id="character-counter"]');

		textarea.on("input", e => {
			const currentLength = e.target.value.length;
			counter.text(`${currentLength} / 500`);
		});

		const form = $(htmlElement).find("form");
		form.submit(this.#handleSubmit);

		return htmlElement;
	}
}
