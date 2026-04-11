import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";
import notificationsService from "@/core/services/notifications.service.js";
import storageService from "@/core/services/storage.service.js";
import { ConfessionsService } from "@/api/confessions.service.js";

import { $ } from "@/core/jquery/jquery.lib.js";

import styles from "./confession.module.scss";
import template from "./confession.template.html";

import { timeAgo } from "@/utils/timeAgo.util.js";
import formService from "@/core/services/form.service.js";

export class Confession extends BaseScreen {
	constructor() {
		super({
			title: "Confession",
		});

		this.htmlElement;
		this.notificationsService = notificationsService;
		this.storageService = storageService;
		this.formService = formService;
		this.confessionsService = new ConfessionsService();
		this.confessionId = window.location.pathname.split("/").pop();
	}

	#renderConfession(htmlElement) {
		const createdConfessions = JSON.parse(
			this.storageService.getItem("createdConfessions"),
		);

		// TODO: JSON.parse(null) даёт null, и доступ createdConfessions[this.confessionId] валит экран у пользователя, который просто открыл confession, но сам его не создавал.
		if (createdConfessions[this.confessionId]) {
			const editButton = $(htmlElement).find('button[data-id="edit-button"]');
			const deleteButton = $(htmlElement).find(
				'button[data-id="delete-button"]',
			);

			editButton.removeClass("hide");
			deleteButton.removeClass("hide");
		}

		this.confessionsService
			.getConfessionById(this.confessionId)
			.then(confession => {
				$(htmlElement)
					.find('span[data-id="confession-id"]')
					.text("#" + confession.id);
				$(htmlElement)
					.find('h1[data-id="confession-title"]')
					.text(confession.title);
				$(htmlElement)
					.find('div[data-id="confession-content"]')
					.text(confession.content);
				$(htmlElement)
					.find('span[data-id="confession-likes"]')
					.text(String(confession.likes));
				$(htmlElement)
					.find('span[data-id="confession-time"]')
					.text(
						timeAgo(
							Math.round(new Date(confession.createdAt).getTime() / 1000),
						),
					);
			});
	}

	#handleShare = () => {
		navigator.clipboard.writeText(window.location.href);

		notificationsService.show({
			type: "success",
			title: "Success",
			message: "Confession shared successfully",
		});
	};

	#likeConfession = (htmlElement, likedConfessions, likeButton) => {
		this.confessionsService.likeConfession(this.confessionId).then(result => {
			// TODO: Клиент безусловно показывает success и пушит id в localStorage, даже если сервер ответил "Already liked". Источник истины расходится, а unlike потом может закончиться 500.
			notificationsService.show({
				type: "success",
				title: "Success",
				message: "Confession liked successfully",
			});

			likedConfessions.push(this.confessionId);

			this.storageService.setItem(
				"likedConfessions",
				JSON.stringify(likedConfessions),
			);

			$(htmlElement)
				.find('span[data-id="confession-likes"]')
				.text(String(result.likes));

			likeButton.attr("data-status", "liked");
		});
	};

	#unlikeConfession = (htmlElement, likedConfessions, likeButton) => {
		this.confessionsService.unlikeConfession(this.confessionId).then(result => {
			const unlikedConfession = likedConfessions.indexOf(this.confessionId);

			likedConfessions.splice(unlikedConfession, 1);

			this.storageService.setItem(
				"likedConfessions",
				JSON.stringify(likedConfessions),
			);

			$(htmlElement)
				.find('span[data-id="confession-likes"]')
				.text(String(result.likes));

			likeButton.attr("data-status", "unliked");
		});
	};

	#handleLikeButton = (htmlElement, likeButton) => {
		const likedConfessions =
			JSON.parse(this.storageService.getItem("likedConfessions")) || [];

		if (likedConfessions.includes(this.confessionId))
			this.#unlikeConfession(htmlElement, likedConfessions, likeButton);
		else this.#likeConfession(htmlElement, likedConfessions, likeButton);
	};

	#handleDeleteButton = () => {
		const createdConfessions = JSON.parse(
			this.storageService.getItem("createdConfessions"),
		);
		const tokenHash = createdConfessions[this.confessionId];

		if (!tokenHash) {
			this.notificationsService.show({
				type: "error",
				title: "Error",
				message: "No permission to delete confession",
			});
			return;
		}

		this.confessionsService
			.deleteConfession(this.confessionId, tokenHash)
			.then(() => {
				this.notificationsService.show({
					type: "success",
					title: "Success",
					message: "Confession deleted successfully",
				});

				setTimeout(() => {
					window.location.href = "/feed";
				}, 1000);
			});
	};

	#showEditForm = htmlElement => {
		const confessionItem = $(htmlElement);
		const confessionContent = $(htmlElement).find(
			'div[data-id="confession-content"]',
		);
		const confessionTitle = $(htmlElement).find(
			'h1[data-id="confession-title"]',
		);

		const confessionTitleValue = confessionTitle.element.innerText;

		confessionContent.changeTag("textarea").attr("name", "content");
		confessionTitle.changeTag("input").attr("name", "title");

		confessionTitle.element.value = confessionTitleValue;

		const editButton = $(htmlElement).find('button[data-id="edit-button"]');
		const deleteButton = $(htmlElement).find('button[data-id="delete-button"]');
		const saveButton = $(htmlElement).find('button[data-id="save-button"]');

		editButton.addClass("hide");
		deleteButton.addClass("hide");
		saveButton.removeClass("hide");

		confessionItem.changeTag("form");
		this.htmlElement = confessionItem.element;
	};

	#handleEditButton = () => {
		this.#showEditForm(this.htmlElement);
	};

	#handleSaveButton = () => {
		const data = this.formService.getFormData(this.htmlElement);

		const createdConfessions = JSON.parse(
			this.storageService.getItem("createdConfessions"),
		);
		const tokenHash = createdConfessions[this.confessionId];

		// TODO: Сообщение и ветка прав здесь смешаны с delete-сценарием, а data не валидируется повторно после редактирования. В итоге edit path хрупкий и даёт путаную диагностику.
		if (!tokenHash) {
			this.notificationsService.show({
				type: "error",
				title: "Error",
				message: "No permission to delete confession",
			});
			return;
		}

		this.confessionsService
			.updateConfession(this.confessionId, data, tokenHash)
			.then(result => {
				if (result.message?.toLowerCase() === "confession updated") {
					this.notificationsService.show({
						type: "success",
						title: "Success",
						message: "Confession updated successfully",
					});

					const newElement = this.render();
					$("main").replaceChildren(newElement);
				}
			});
	};

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);

		// TODO: После перевода карточки в form стоит либо вешать submit на форму, либо явно контролировать типы кнопок и валидацию. Сейчас save/edit/delete завязаны на click-обработчики и легко расходятся с семантикой формы.
		this.#renderConfession(htmlElement);

		const shareButton = $(htmlElement).find("button[data-id='share-button']");
		const likeButton = $(htmlElement).find("button[data-id='like-button']");
		const editButton = $(htmlElement).find('button[data-id="edit-button"]');
		const saveButton = $(htmlElement).find('button[data-id="save-button"]');
		const deleteButton = $(htmlElement).find('button[data-id="delete-button"]');

		const likedConfessions =
			JSON.parse(this.storageService.getItem("likedConfessions")) || [];

		if (likedConfessions.includes(this.confessionId)) {
			likeButton.attr("data-status", "liked");
		}

		shareButton.on("click", this.#handleShare);
		likeButton.on("click", () => {
			this.#handleLikeButton(htmlElement, likeButton);
		});
		editButton.on("click", () => {
			this.#handleEditButton(htmlElement);
		});
		saveButton.on("click", () => {
			this.#handleSaveButton(htmlElement);
		});
		deleteButton.on("click", this.#handleDeleteButton);

		this.htmlElement = htmlElement;

		return htmlElement;
	}
}
