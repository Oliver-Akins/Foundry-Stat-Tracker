/* eslint-disable no-unused-vars */
import { Table } from "./model.mjs";

export class MemoryDatabase {
	static getTables() {
		/** @type {Array<{ name: string; }>} */
		return [
			{ name: `Dice/d4` },
			{ name: `Dice/d6` },
			{ name: `Dice/d8` },
			{ name: `Dice/d10` },
			{ name: `Dice/d12` },
			{ name: `Dice/d20` },
			{ name: `Dice/d100` },
			{ name: `Count of Successes` },
		];
	};

	static createRow(table, user, row) {};

	static getRows(tableId, ...users) {
		if (users.length === 0) { users = [game.user] };

		const datasets = {};

		return datasets;
	};

	static updateRow(table, user, rowId, changes) {};

	static deleteRow(table, user, rowId) {};
};

/* eslint-enable no-unused-vars */
