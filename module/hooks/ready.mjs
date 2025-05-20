import { Database } from "../utils/databases/Database.mjs";
import { Logger } from "../utils/Logger.mjs";

Hooks.on(`ready`, () => {
	Logger.log(`Version: ${__VERSION__}`);

	// Alert GMs when the configured DB is invalid
	if (!(CONFIG.stats.db.prototype instanceof Database) && game.user.isGM) {
		ui.notifications.error(`The database handler does not conform to the required heirarchy, the stats tracker module will almost certainly not work correctly.`, { permanent: true });
	} else {
		CONFIG.stats.db.registerListeners();
	};
});
