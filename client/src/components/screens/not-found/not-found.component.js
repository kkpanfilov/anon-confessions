import { BaseScreen } from "@/core/component/base-screen.component.js";

export class NotFound extends BaseScreen {
	constructor() {
		super({
			title: "404",
		});
	}

	render() {
		return "<div>Not Found</div>";
	}
}
