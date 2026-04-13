import { BaseScreen } from "@/core/component/base-screen.component.js";

import formService from "@/core/services/form.service.js";
import renderService from "@/core/services/render.service.js";
import notificationsService from "@/core/services/notifications.service.js";
import storageService from "@/core/services/storage.service.js";
import { ConfessionsService } from "@/api/confessions.service.js";

import { $ } from "@/core/jquery/jquery.lib.js";

import styles from "./add.module.scss";
import template from "./add.template.html";

export class Add extends BaseScreen {
	constructor() {
		super({
			title: "New confession",
		});

		this.confessionsService = new ConfessionsService();
		this.storageService = storageService;
		this.formService = formService;
	}

	#handleSubmit = event => {
		// TODO: Здесь нет trim/нормализации, нет блокировки повторного submit и нет safe-ветки на случай, если API вернул undefined после ошибки. Сейчас один неуспешный запрос легко превращается в падение на result.id/result.tokenHash.
		const data = this.formService.getFormData(event.target);

		if (!data.content) {
			notificationsService.show({
				type: "error",
				title: "Error",
				message: "Content is required",
			});
			return;
		}

		if (!data.title) {
			data.title = "Anonymous confession";
		}

		this.confessionsService.createConfession(data).then(result => {
			notificationsService.show({
				type: "success",
				title: "Success",
				message: "Confession created successfully",
			});

			console.log("result", result);
			// TODO: Секрет владения хранится в localStorage. Для проекта без auth это допустимо только пока в приложении жёстко исключён XSS; иначе любой инъецированный скрипт мгновенно заберёт право редактировать и удалять записи.
			const createdConfessions =
				JSON.parse(this.storageService.getItem("createdConfessions")) || {};

			createdConfessions[result.id] = result.ownerToken;

			console.log("createdConfessions", createdConfessions);
			this.storageService.setItem(
				"createdConfessions",
				JSON.stringify(createdConfessions),
			);

			setTimeout(() => {
				window.location.href = `/confession/${result.id}`;
			}, 1000);
		});
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
