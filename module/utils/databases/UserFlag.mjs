/* eslint-disable no-unused-vars */
import { Table } from "./model.mjs";

const tablesFlag = `tables`;

export class UserFlagDatabase {
	static getTables() {
		/** @type {Array<{ name: string; }>} */
		const tableConfig = game.settings.get(__ID__, `tables`);
		return tableConfig ?? [];
	};

	static createRow(table, user, row) {};

	static getRows(tableId, ...users) {
		if (users.length === 0) { users = [game.user] };

		const datasets = {};
		for (const user of users) {
			const tables = user.getFlag(__ID__, tablesFlag) ?? {};
			if (tables[tableId] === undefined) {
				datasets[user.id] = null;
				continue;
			};

			const table = new Table(tables[tableId]);
		}
		return datasets;
	};

	static updateRow(table, user, rowId, changes) {};

	static deleteRow(table, user, rowId) {};
};

/* eslint-enable no-unused-vars */
