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
	Perform any required data migration if any is required for the version
	jump that the user may have caused. This only migrates the data iff the
	currently authenticated user is able to perform the full migration of
	data.
	*/
	const db = CONFIG.stats.db;
	const lastVersion = game.settings.get(__ID__, `lastVersion`);
	const canDoMigration = db.canPerformMigration();
	const requiresMigration = db.requiresMigrationFrom(lastVersion);
	if (requiresMigration) {
		if (canDoMigration) {
			const notif = ui.notifications.info(
				`${__TITLE__} | Performing data migration, please do not close the window`,
				{ progress: true, permanent: true },
			);

			// Fire and forget
			CONFIG.stats.db.migrateData(notif)
				.then(() => {
					game.settings.set(__ID__, __VERSION__);
					setTimeout(() => ui.notifications.remove(notif), 500);
				});
		} else {
			ui.notifications.error(
				`The stat-tracker database is out of date, temporarily disabling the stat-tracker module's functionality until the migration can be performed by a GM user logging into the world.`,
				{ console: false, permanent: true },
			);
			CONFIG.stats.db = NilDatabase;
		};
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
