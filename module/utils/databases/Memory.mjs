import { filterPrivateRows, PrivacyMode } from "../privacy.mjs";
import { createDiceTable } from "./utils.mjs";
import { Database } from "./Database.mjs";
import { validateBucketConfig } from "../buckets.mjs";

const { deleteProperty, diffObject, expandObject, mergeObject, randomID } = foundry.utils;

export class MemoryDatabase extends Database {
	static #tables = {
		"Dice/d10": createDiceTable(10),
		"Dice/d20": createDiceTable(20),
		"Dice/d100": createDiceTable(100),
		"Successes Number": {
			name: `Successes Number`,
			buckets: {
				type: `number`,
				min: 0,
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
		"Successes Range": {
			name: `Successes Range`,
			buckets: {
				type: `range`,
				min: 0,
				max: 100,
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
				choices: [`Normal`, `Popped Off`, `Downed`],
			},
			graph: {
				type: `bar`,
				stacked: true,
			},
		},
	};

	static #rows = {};

	static async createTable(tableConfig) {
		this.#tables[tableConfig.name] = tableConfig;
		this.render();
		return true;
	};

	static async getTableNames() {
		const tables = new Set();
		for (const tableID of Object.keys(this.#tables)) {
			const [ targetTable ] = tableID.split(`/`, 2);
			tables.add(targetTable);
		};
		return Array.from(tables);
	};

	static async getSubtableNames(table) {
		const subtables = new Set();
		for (const tableID of Object.keys(this.#tables)) {
			const [ targetTable, targetSubtable ] = tableID.split(`/`, 2);
			if (targetTable === table) {
				subtables.add(targetSubtable);
			}
		};
		return Array.from(subtables);
	};

	/** @returns {Array<Table>} */
	static async getTables() {
		return Object.values(this.#tables);
	};

	static async getTable(tableID) {
		return this.#tables[tableID];
	};

	static async updateTable(tableID, changes) {
		const table = this.getTable(tableID);
		if (!table) { return false };

		// Bucket coercion in case called via the API
		deleteProperty(changes, `name`);
		deleteProperty(changes, `buckets.type`);

		const diff = diffObject(
			table,
			expandObject(changes),
			{ inner: true, deletionKeys: true },
		);
		if (Object.keys(diff).length === 0) { return false };

		const updated = mergeObject(
			table,
			diff,
			{ inplace: false, performDeletions: true },
		);

		try {
			updated.buckets = validateBucketConfig(updated.buckets);
		} catch (e) {
			ui.notifications.error(e);
			return false;
		};

		this.#tables[tableID] = updated;
		return true;
	};

	static async deleteTable(tableID) {
		return delete this.#tables[tableID];
	};

	static async createRow(table, userID, row, { rerender = true } = {}) {
		if (!this.#tables[table]) { return };
		this.#rows[userID] ??= {};
		this.#rows[userID][table] ??= [];

		// data format assertions
		row._id ||= randomID();
		row.timestamp = new Date().toISOString();

		this.#rows[userID][table].push(row);
		if (rerender) {
			this.render({ userUpdated: userID });
		};
	};

	static async createRows(table, userID, rows, { rerender = true } = {}) {
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

	static async getRows(tableID, userIDs, privacy = [PrivacyMode.PUBLIC]) {
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

	static async updateRow(table, userID, rowID, changes) {
		if (!this.#tables[table] || !this.#rows[userID]?.[table]) { return };
		let row = this.#rows[userID][table].find(row => row._id === rowID);
		if (!row) { return };
		mergeObject(row, changes);
		this.render({ userUpdated: userID });
	};

	static async deleteRow(table, userID, rowID) {
		if (!this.#tables[table] || !this.#rows[userID]?.[table]) { return };
		let rowIndex = this.#rows[userID][table].findIndex(row => row._id === rowID);
		if (rowIndex === -1) { return };
		this.#rows[userID][table].splice(rowIndex, 1);
		this.render({ userUpdated: userID });
	};
};
