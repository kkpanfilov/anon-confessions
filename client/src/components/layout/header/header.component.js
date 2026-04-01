import ChildComponent from "@/core/component/child.component.js";
import renderService from "@/core/services/render.service.js";

import styles from "./header.module.scss";
import template from "./header.template.html";

import Logo from "./logo/logo.component.js";
import Search from "./search/search.component.js";
import AddButton from "./add-button/add-button.component.js";

export default class Header extends ChildComponent {
	render() {
		this.element = renderService.htmlToElement(
			template,
			{
				logo: new Logo().render(),
				search: new Search().render(),
				"add-button": new AddButton().render(),
			},
			styles,
		);

		return this.element;
	}
}
