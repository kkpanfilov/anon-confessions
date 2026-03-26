import { $ } from "../jquery/jquery.lib.js";

import { NotFound } from "@/components/screens/not-found/not-found.component.js";

import { Layout } from "@/components/layout/layout.component.js";

import { ROUTES } from "./routes.data.js";

export class Router {
	#routes;
	#currentRoute;
	#layout = null;

	constructor() {
		this.#routes = ROUTES;
		this.#currentRoute = null;

		this.#handleRouteChange();
		this.#handleLinks();
		this.#handlePopstate();
	}

	#handleRouteChange() {
		const path = this.getCurrentPath() || "/feed";

		let route;

		if (path === "/") {
			window.history.pushState({}, "", "/feed");
			this.#handleRouteChange()
			return;
		}

		route = this.#routes.find(item => item.path === path);

		if (!route) {
			route = {
				component: NotFound,
			};
		}

		this.#currentRoute = route;
		this.#render();
	}

	#handleLinks() {
		const allLinks = document.querySelectorAll("a");

		for (const linkElem of allLinks) {
			linkElem.addEventListener("click", e => {
				e.preventDefault();

				const path = e.target.getAttribute("href");
				window.history.pushState({}, "", path);

				this.#handleRouteChange();
			});
		}
	}

	#handlePopstate() {
		window.addEventListener("popstate", () => {
			this.#handleRouteChange();
		});
	}

	getCurrentPath() {
		return window.location.pathname;
	}

	#render() {
		const component = new this.#currentRoute.component();

		if (!this.#layout) {
			this.#layout = new Layout({ router: this, children: component.render() });
			$("#app").append(this.#layout.render());
		} else {
			$("main").append(component.render());
		}
	}
}
