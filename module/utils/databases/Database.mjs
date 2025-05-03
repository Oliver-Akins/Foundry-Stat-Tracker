/* eslint-disable no-unused-vars */

export class Database {
	// MARK: Table Ops
	static createTable(tableConfig) {
		if (!game.user.isGM) {
			ui.notifications.error(`You do not have the required permission to create a new table`);
			return false;
		};

		const tables = game.settings.get(__ID__, `tables`);
		if (tables[tableConfig.name]) {
			ui.notifications.error(`Cannot create table that already exists`);
			return false;
		};

		tables[tableConfig.name] = tableConfig;
		game.settings.set(__ID__, `tables`, tables);
		return true;
	};

	/** @returns {Array<Table>} */
	static getTables() {
		const tables = game.settings.get(__ID__, `tables`);
		return Object.values(tables) ?? [];
	};

	static getTable(tableID) {
		const tables = game.settings.get(__ID__, `tables`);
		if (!tables[tableID]) { return };
		return tables[tableID];
	};

	static deleteTable(tableID) {
		if (!game.user.isGM) {
			ui.notifications.error(`You do not have the required permission to delete a table`);
			return false;
		};

		const tables = game.settings.get(__ID__, `tables`);
		if (!tables[tableID]) {
			ui.notifications.error(`Cannot delete a table that doesn't exist`);
			return false;
		};

		delete tables[tableID];
		game.settings.set(__ID__, `tables`, tables);
		return true;
	};

	// MARK: Row Ops
	static createRow(table, userID, row) {
		throw new Error(`createRow() must be implemented`);
	};

	static getRows(tableID, userIDs, privacy = `none`) {
		throw new Error(`getRows() must be implemented`);
	};

	static updateRow(table, userID, rowID, changes) {
		throw new Error(`updateRow() must be implemented`);
	};

	static deleteRow(table, userID, rowID) {
		throw new Error(`deleteRow() must be implemented`);
	};

	// MARK: Applications
	static _apps = new Map();

	/**
	 * Adds an application into the registry so that when a data update
	 * is received, we can re-render the sheets.
	 *
	 * @param app an ApplicationV2 instance
	 */
	static addApp(app) {
		this._apps.set(app.id, app);
		this.registerListeners();
	};

	/**
	 * Adds an application into the registry so that when a data update
	 * is received, we can re-render the sheets.
	 *
	 * @param app an ApplicationV2 instance
	 */
	static removeApp(app) {
		this._apps.delete(app.id);
		if (this._apps.size === 0) {
			this.unregisterListeners();
		};
	};

	/**
	 * Rerenders all of the applications that are displaying data from
	 * this database
	 */
	static render() {
		for (const app of Object.values(this.apps)) {
			app.render();
		};
	};

	// MARK: Listeners
	/**
	 * Used to listen for changes from other clients and rerender the apps
	 * as required in order to keep the data as up-to-date as possible.
	 */
	static registerListeners() {};

	static unregisterListeners() {};
};

/* eslint-enable no-unused-vars */
