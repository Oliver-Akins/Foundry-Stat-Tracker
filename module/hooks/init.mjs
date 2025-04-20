import { registerMetaSettings } from "../settings/meta.mjs";
import { Logger } from "../utils/Logger.mjs";

Hooks.on(`init`, () => {
	Logger.debug(`Initializing`);

	registerMetaSettings();
});
