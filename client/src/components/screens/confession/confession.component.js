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

	#handleLike = (htmlElement, likeButton) => {
		const likedConfessions =
			JSON.parse(this.storageService.getItem("likedConfessions")) || [];

		if (likedConfessions.includes(this.confessionId)) {
			notificationsService.show({
				type: "error",
				title: "Error",
				message: "You already liked this confession",
			});
		} else {
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
		}
	};

	render() {
		const htmlElement = renderService.htmlToElement(template, [], styles);

		this.#renderConfession(htmlElement);

		const shareButton = $(htmlElement).find("button[data-id='share-button']");
		const likeButton = $(htmlElement).find("button[data-id='like-button']");

		const likedConfessions =
			JSON.parse(this.storageService.getItem("likedConfessions")) || [];

		if (likedConfessions.includes(this.confessionId)) {
			likeButton.attr("data-status", "liked");
		}

		shareButton.on("click", this.#handleShare);
		likeButton.on("click", () => {
			this.#handleLike(htmlElement, likeButton);
		});

		return htmlElement;
	}
}
