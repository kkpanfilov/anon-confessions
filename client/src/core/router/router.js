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
			this.#handleRouteChange();
			return;
		}

		route = this.#routes.find(item => this.#matchPath(item.path, path));

		if (!route) {
			route = {
				component: NotFound,
			};
		}

		this.#currentRoute = route;
		this.#render();
	}

	#handleLinks() {
		document.addEventListener("click", e => {
			if (
				e.defaultPrevented ||
				e.button !== 0 ||
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.altKey
			) {
				return;
			}

			const linkElem = e.target.closest("a[href]");

			if (!linkElem) return;
			if (linkElem.target && linkElem.target !== "_self") return;
			if (linkElem.hasAttribute("download")) return;

			const href = linkElem.getAttribute("href");
			if (!href || href.startsWith("#")) return;

			const url = new URL(href, window.location.origin);
			if (url.origin !== window.location.origin) return;
			if (url.pathname === window.location.pathname && url.search === window.location.search) {
				return;
			}

			e.preventDefault();
			window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
			this.#handleRouteChange();
		});
	}

	#handlePopstate() {
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
