import { BaseScreen } from "@/core/component/base-screen.component.js";

export class Add extends BaseScreen {
	constructor() {
		super({
			title: "New confession",
		});
	}

	render() {
		return "<div>Add</div>";
	}
}
