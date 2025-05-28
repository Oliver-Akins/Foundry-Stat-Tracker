import { Database } from "../utils/databases/Database.mjs";
import { Logger } from "../utils/Logger.mjs";
import { NilDatabase } from "../utils/databases/NilDatabase.mjs";

Hooks.on(`ready`, () => {
	Logger.log(`Version: ${__VERSION__}`);

	// Alert GMs when the configured DB is invalid
	if (!(CONFIG.stats.db.prototype instanceof Database) && game.user.isGM) {
		ui.notifications.error(`The database adapter does not conform to the required specification, the stats tracker module overrode the configured database adapter with a stub to protect data that exists already.`, { permanent: true });
		CONFIG.stats.db = NilDatabase;
	};

	/*
	Prevent any run-time modifications to the CONFIG API so that users can't wreck
	themselves nor their data by fooling around with the values.
	*/
	if (import.meta.env.PROD) {
		Object.freeze(CONFIG.stats);
	};

	CONFIG.stats.db.registerListeners();
});
