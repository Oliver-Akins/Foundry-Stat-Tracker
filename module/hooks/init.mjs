// Databases
import { MemoryDatabase } from "../utils/databases/Memory.mjs";
import { UserFlagDatabase } from "../utils/databases/UserFlag.mjs";

// Applications
import { StatSidebar } from "../Apps/StatSidebar.mjs";
import { StatsViewer } from "../Apps/StatsViewer.mjs";
import { TableCreator } from "../Apps/TableCreator.mjs";
import { TableManager } from "../Apps/TableManager.mjs";

// Misc Imports
import { api } from "../api.mjs";
import helpers from "../handlebarsHelpers/_index.mjs";
import { Logger } from "../utils/Logger.mjs";
import { registerCustomComponents } from "../Apps/elements/_index.mjs";
import { registerMetaSettings } from "../settings/meta.mjs";
import { registerUserSettings } from "../settings/user.mjs";
import { registerWorldSettings } from "../settings/world.mjs";

Hooks.on(`init`, () => {
	Logger.debug(`Initializing`);

	registerMetaSettings();
	registerWorldSettings();
	registerUserSettings();

	// Add a custom sidebar tab for the module
	if (game.settings.get(__ID__, `statsSidebarTab`)) {
		CONFIG.ui.sidebar.TABS.stats = {
			active: false,
			icon: `fa-solid fa-chart-line`,
			tooltip: `Stats!`,
		};
		CONFIG.ui.stats = StatSidebar;

		// Inject the custom tab right before settings
		const temp = CONFIG.ui.sidebar.TABS.settings;
		delete CONFIG.ui.sidebar.TABS.settings;
		CONFIG.ui.sidebar.TABS.settings = temp;
	};


	CONFIG.stats = {
		db: UserFlagDatabase,
		viewer: StatsViewer,
		creator: TableCreator,
		manager: TableManager,
	};

	if (import.meta.env.DEV) {
		CONFIG.stats.db = MemoryDatabase;
	};

	game.modules.get(__ID__).api = api;
	if (game.settings.get(__ID__, `globalAPI`)) {
		Object.defineProperty(
			globalThis,
			`stats`,
			{
				value: api,
				writable: false,
			},
		);
	};

	Handlebars.registerHelper(helpers);
	registerCustomComponents();
});
