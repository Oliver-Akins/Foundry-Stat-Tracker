import { CustomMultiSelect } from "./CustomMultiSelect.mjs";
import { Logger } from "../../utils/Logger.mjs";

const components = [
	CustomMultiSelect,
];

export function registerCustomComponents() {
	(CONFIG.CACHE ??= {}).componentListeners ??= [];
	for (const component of components) {
		if (!window.customElements.get(component.tagName)) {
			Logger.debug(`Registering component "${component.tagName}"`);
			window.customElements.define(
				component.tagName,
				component,
			);
		};
	}
};
