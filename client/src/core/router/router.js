import { NotFound } from "@/components/screens/not-found/not-found.component.js";

import { ROUTES } from "./routes.data.js";

export class Router {
	#routes;
	#currentRoute;

	constructor() {
		this.#routes = ROUTES;
		this.#currentRoute = null;

		this.#handleRouteChange();
	}

	getCurrentPath() {
		return window.location.pathname;
	}

	render() {
		const component = new this.#currentRoute.component;
		document.querySelector("#app").innerHTML = component.render();
	}

	#handleRouteChange() {
		const path = this.getCurrentPath() || "/feed";
		let route = this.#routes.find(item => item.path === path);

		if (!route) {
			route = {
				component: NotFound,
			};
		}

		this.#currentRoute = route;
		this.render();
	}
}
