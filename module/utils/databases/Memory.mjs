import { Database } from "./Database.mjs";
import { filterPrivateRows } from "../privacy.mjs";
import { Logger } from "../Logger.mjs";

const { randomID, mergeObject } = foundry.utils;

export class MemoryDatabase extends Database {
	static #tables = {
		"Dice/d10": {
			name: `Dice/d10`,
			buckets: {
				type: `range`,
				min: 1,
				max: 10,
				step: 1,
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
		"Dice/d20": {
			name: `Dice/d20`,
			buckets: {
				type: `range`,
				min: 1,
				max: 20,
				step: 1,
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
		"Dice/d100": {
			name: `Dice/d100`,
			buckets: {
				type: `range`,
				min: 1,
				max: 100,
				step: 1,
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
		"Count of Successes": {
			name: `Count of Successes`,
			buckets: {
				type: `number`,
				min: 0,
				step: 1,
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
		"Type of Result": {
			name: `Type of Result`,
			buckets: {
				type: `string`,
				trim: true, // forced true
				blank: false, // forced false
				textSearch: false, // forced false
				choices: [`Normal`, `Popped Off`, `Downed`],
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
	};

	static #rows = {};

	static createTable(tableConfig) {
		this.#tables[tableConfig.name] = tableConfig;
		this.render();
		return true;
	};

	/** @returns {Array<Table>} */
	static getTables() {
		return Object.values(this.#tables);
	};

	static getTable(tableID) {
		return this.#tables[tableID];
	};

	static createRow(table, userID, row, { rerender = true } = {}) {
		if (!this.#tables[table]) { return };
		this.#rows[userID] ??= {};
		this.#rows[userID][table] ??= [];

		// data format assertions
		row._id ||= randomID();
		row.timestamp = new Date().toISOString();

		Logger.debug(`Adding row:`, row);
		this.#rows[userID][table].push(row);
		if (rerender) {
			this.render({ userUpdated: userID });
		};
	};

	static createRows(table, userID, rows, { rerender = true } = {}) {
		if (!this.#tables[table]) { return };
		this.#rows[userID] ??= {};
		this.#rows[userID][table] ??= [];

		// data format assertions
		for (const row of rows) {
			this.createRow( table, userID, row, { rerender: false } );
		};

		if (rerender) {
			this.render({ userUpdated: userID });
		};
	};

	static getRows(tableID, userIDs, privacy = `none`) {
		if (userIDs.length === 0) {
			return {};
		};

		const datasets = {};

		for (const userID of userIDs) {
			if (this.#rows[userID]?.[tableID]) {
				datasets[userID] = filterPrivateRows(
					this.#rows[userID][tableID] ?? [],
					userID,
					privacy,
				);
			};
		}

		return datasets;
	};

	static updateRow(table, userID, rowID, changes) {
		if (!this.#tables[table] || !this.#rows[userID]?.[table]) { return };
		let row = this.#rows[userID][table].find(row => row._id === rowID);
		if (!row) { return };
		mergeObject(row, changes);
		this.render({ userUpdated: userID });
	};

	static deleteRow(table, userID, rowID) {
		if (!this.#tables[table] || !this.#rows[userID]?.[table]) { return };
		let rowIndex = this.#rows[userID][table].findIndex(row => row._id === rowID);
		if (rowIndex === -1) { return };
		this.#rows[userID][table].splice(rowIndex, 1);
		this.render({ userUpdated: userID });
	};

	/**
	 * Used to listen for changes from other clients and refresh the local DB as
	 * required, so that the StatsTracker stays up to date.
	 */
	static registerListeners() {};

	static unregisterListeners() {};
};
