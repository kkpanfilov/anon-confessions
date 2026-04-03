import { BaseScreen } from "@/core/component/base-screen.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./feed.module.scss";
import template from "./feed.template.html";

import ConfessionItem from "@/components/screens/feed/confession-item/confession-item.component.js";
import { $ } from "@/core/jquery/jquery.lib.js";

export class Feed extends BaseScreen {
	constructor() {
		super({
			title: "Feed",
		});
	}

	render() {
		const confessions = [
			{
				id: "1",
				date: 1747180800,
				content:
					"I pretend to be busy at work sometimes just so people don't give me more tasks.",
				likes: 12,
			},
			{
				id: "2",
				date: 1747008000,
				content:
					"I often replay conversations in my head and wish I had said something different.",
				likes: 34,
			},
			{
				id: "3",
				date: 1746835200,
				content:
					"Sometimes I feel more comfortable talking to strangers online than to people I know.",
				likes: 27,
			},
			{
				id: "4",
				date: 1746576000,
				content:
					"I start learning new things with excitement but rarely finish them.",
				likes: 41,
			},
			{
				id: "5",
				date: 1743379200,
				content:
					"I check my phone even when I know there are no new notifications.",
				likes: 19,
			},
			{
				id: "6",
				date: 1730419200,
				content:
					"Sometimes I stay up late just to have some quiet time for myself.",
				likes: 53,
			},
			{
				id: "7",
				date: 1722470400,
				content: "I compare myself to others more than I'd like to admit.",
				likes: 46,
			},
			{
				id: "8",
				date: 1704067200,
				content:
					"I feel guilty when I take breaks, even though I know I need them.",
				likes: 22,
			},
			{
				id: "9",
				date: 1696118400,
				content:
					"Sometimes I laugh at jokes I don't actually find funny just to fit in.",
				likes: 31,
			},
			{
				id: "10",
				date: 1679616000,
				content:
					"I want to change my life, but I don't always know where to start.",
				likes: 67,
			},
		];

		const htmlElement = renderService.htmlToElement(template, {}, styles);

		const feedList = $(htmlElement).find("div[data-id='feed-list']");

		feedList.clear();

		confessions.forEach(confession => {
			const confessionClone = new ConfessionItem(confession).render();
			feedList.append(confessionClone);
		});

		return htmlElement;
	}
}
