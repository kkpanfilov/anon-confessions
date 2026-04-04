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
		console.log("Handle route change");
		const path = this.getCurrentPath() || "/feed";

		let route;

		if (path === "/") {
			window.history.pushState({}, "", "/feed");
			this.#handleRouteChange();
			return;
		}

		route = this.#routes.find(item => this.#matchPath(item.path, path));
		console.log("Route:", route);

		if (!route) {
			route = {
				component: NotFound,
			};
		}

		this.#currentRoute = route;
		this.#render();
	}

	#handleLinks() {
		console.log("Handle links");
		const allLinks = document.querySelectorAll("a");

		for (const linkElem of allLinks) {
			linkElem.addEventListener("click", e => {
				e.preventDefault();

				const path = e.currentTarget.getAttribute("href");
				window.history.pushState({}, "", path);

				this.#handleRouteChange();
			});
		}
	}

	#handlePopstate() {
		console.log("Handle popstate");
		window.addEventListener("popstate", () => {
			this.#handleRouteChange();
		});
	}

	#matchPath(routePath, currentPath) {
		const a = routePath.split("/").filter(Boolean);
		const b = currentPath.split("/").filter(Boolean);
		if (a.length !== b.length) return false;

		return a.every((seg, i) => seg.startsWith(":") || seg === b[i]);
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
			$("main").replaceChildren(component.render());
		}
	}
}
