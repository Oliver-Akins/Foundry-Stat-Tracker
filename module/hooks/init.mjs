import helpers from "../handlebarsHelpers/_index.mjs";
import { Logger } from "../utils/Logger.mjs";
import { MemoryDatabase } from "../utils/databases/Memory.mjs";
import { registerCustomComponents } from "../Apps/elements/_index.mjs";
import { registerMetaSettings } from "../settings/meta.mjs";
import { UserFlagDatabase } from "../utils/databases/UserFlag.mjs";

Hooks.on(`init`, () => {
	Logger.debug(`Initializing`);

	registerMetaSettings();

	if (import.meta.env.PROD) {
		CONFIG.StatsDatabase = UserFlagDatabase;
	} else {
		CONFIG.StatsDatabase = MemoryDatabase;
	}

	Handlebars.registerHelper(helpers);
	registerCustomComponents();
});
