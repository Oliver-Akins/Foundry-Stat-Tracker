/* eslint-disable no-unused-vars */
import { Table } from "./model.mjs";

const { randomID } = foundry.utils;

function generateRow(value, isPrivate = false) {
	return {
		id: randomID(),
		timestamp: Date.now(),
		value,
		isPrivate,
	};
};

function getNormalDistributionHeight(x, a, b) {
	const maxHeight = b;
	return Math.round(Math.exp(-( ((x - a) ** 2) / b )) * maxHeight);
};

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

	static #cache = {};

	static getRows(tableID, users) {
		if (users.length === 0) {
			return {};
		};

		const datasets = {};

		for (const user of users) {
			if (this.#cache[user]?.[tableID]) {
				datasets[user] = this.#cache[user][tableID];
			} else {

				const [table, subtable] = tableID.split(`/`);
				if (!subtable) {
					continue;
				}

				const size = Number.parseInt(subtable.slice(1));
				const rows = [];

				for (let i = 1; i <= size; i++) {
					const count = getNormalDistributionHeight(i, size / 2, size);
					const temp = new Array(count)
						.fill(null)
						.map(() => generateRow(
							game.user.id == user ? i : Math.ceil(Math.random() * size),
						));
					rows.push(...temp);
				};

				this.#cache[user] ??= {};
				datasets[user] = this.#cache[user][tableID] = rows;
			}
		}

		return datasets;
	};

	static updateRow(table, user, rowId, changes) {};

	static deleteRow(table, user, rowId) {};
};

/* eslint-enable no-unused-vars */
