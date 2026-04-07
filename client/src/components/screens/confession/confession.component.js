import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";
import notificationsService from "@/core/services/notifications.service.js";
import storageService from "@/core/services/storage.service.js";
import { ConfessionsService } from "@/api/confessions.service.js";

import { $ } from "@/core/jquery/jquery.lib.js";

import styles from "./confession.module.scss";
import template from "./confession.template.html";

import { timeAgo } from "@/utils/timeAgo.js";

export class Confession extends BaseScreen {
	constructor() {
		super({
			title: "Confession",
		});

		this.notificationsService = notificationsService;
		this.storageService = storageService;
		this.confessionsService = new ConfessionsService();
		this.confessionId = window.location.pathname.split("/").pop();
	}

	#renderConfession(htmlElement) {
		const createdConfessions = JSON.parse(
			this.storageService.getItem("createdConfessions"),
		);

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

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);

		this.#renderConfession(htmlElement);

		const shareButton = $(htmlElement).find("button[data-id='share-button']");
		const likeButton = $(htmlElement).find("button[data-id='like-button']");
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
		deleteButton.on("click", this.#handleDeleteButton);

		return htmlElement;
	}
}
