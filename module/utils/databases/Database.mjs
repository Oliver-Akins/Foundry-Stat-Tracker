/* eslint-disable no-unused-vars */

/*
NOTE:
This database design currently does not support anything like a default subtable
or nested tables more than 1-layer deep. These limitations are currently intentional
and if the desire for those functionalities is requested, this is some information
on how they can be implemented.

Tables >= 1 layer deep:
	Adding a "parent" property to each table that accepts a table's ID, there will
	need to be a defined table at the specified ID, and each table's ID should no
	longer contain the parent table(s) within it (e.g. "Dice/d4" -> "d4"). This
	could also be made in such a way where any buckets/graph settings on the parent
	are applied to the subtable when it is created. The primary unknown with this
	idea is what do we do when someone has a table like "Dice/d4" and then attempts
	to make a subtable "Dice/d4/crits" or something like that.

Default Subtables:
	This would require a partial implementation similar to the Tables >= 1 layer
	deep, however each table would accept an "options" top level property that accepts
	a "defaultSubtable" property specifying the ID of the subtable that should be
	selected by default, this defaultSubtable property would *only* be valid on
	tables that are parents to other tables.
*/

export class Database {
	// MARK: Table Ops
	static createTable(tableConfig) {
		if (!game.user.isGM) {
			ui.notifications.error(`You do not have the required permission to create a new table`);
			return false;
		};

		const name = tableConfig.name;
		if (name.split(`/`).length > 2) {
			ui.notifications.error(`Subtables are not able to have subtables`);
			return false;
		}

		const tables = game.settings.get(__ID__, `tables`);
		const [ table, subtable ] = name.split(`/`);
		if (subtable && tables[table]) {
			ui.notifications.error(`Cannot add subtable for a table that already exists`);
			return false;
		}

		if (tables[name]) {
			ui.notifications.error(`Cannot create table that already exists`);
			return false;
		};

		tables[name] = tableConfig;
		game.settings.set(__ID__, `tables`, tables);
		this.render();
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
	static createRow(table, userID, row, opts) {
		throw new Error(`createRow() must be implemented`);
	};

	static createRows(table, userID, rows, opts) {
		throw new Error(`createRows() must be implemented`);
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
	static render(opts) {
		for (const app of this._apps.values()) {
			app.render(opts);
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
