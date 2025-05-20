import { filterPrivateRows, PrivacyMode } from "../privacy.mjs";
import { Database } from "./Database.mjs";
import { Logger } from "../Logger.mjs";

const { hasProperty, mergeObject, randomID } = foundry.utils;

const dataFlag = `rows`;

export class UserFlagDatabase extends Database {
	// MARK: Row Ops
	static async createRow(tableID, userID, row, { rerender = true } = {}) {
		const table = await this.getTable(tableID);
		let user = game.users.get(userID);
		if (!table || !user) { return };

		row._id ||= randomID();
		row.timestamp = new Date().toISOString();

		const userData = user.getFlag(__ID__, dataFlag);
		userData[tableID] ??= [];
		userData[tableID].push(row);
		await user.setFlag(__ID__, dataFlag, userData);

		if (rerender) {
			this.render({ userUpdated: userID });
		};
		this.triggerListeners();
	};

	static async createRows(tableID, userID, rows, { rerender = true } = {}) {
		const table = await this.getTable(tableID);
		let user = game.users.get(userID);
		if (!table || !user) { return };

		const userData = user.getFlag(__ID__, dataFlag) ?? {};
		userData[tableID] ??= [];

		for (const row of rows) {
			row._id ||= randomID();
			row.timestamp = new Date().toISOString();
			userData[tableID].push(row);
		};

		await user.setFlag(__ID__, dataFlag, userData);

		if (rerender) {
			this.render({ userUpdated: userID });
		};
		this.triggerListeners();
	};

	static async getRows(tableID, userIDs, privacy = [PrivacyMode.PUBLIC]) {
		const table = await this.getTable(tableID);
		if (!table) { return };
		if (!userIDs || userIDs.length === 0) { userIDs = [game.user.id] };

		const datasets = {};
		for (const userID of userIDs) {
			const user = game.users.get(userID);
			if (!user) {
				Logger.warn(`Failed to find user with ID "${userID}", skipping.`);
				continue;
			};

			const userData = user.getFlag(__ID__, dataFlag) ?? {};
			datasets[userID] = filterPrivateRows(
				userData[tableID] ?? [],
				userID,
				privacy,
			);
		};

		return datasets;
	};

	static async updateRow(tableID, userID, rowID, changes) {
		const table = await this.getTable(tableID);
		if (!table) {
			Logger.error(`Cannot find the table with ID "${tableID}"`);
			return;
		};

		const user = game.users.get(userID);
		if (!user) {
			Logger.error(`Can't find the user with ID "${tableID}"`);
			return;
		};

		const userData = user.getFlag(__ID__, dataFlag) ?? {};
		let row = userData[tableID]?.find(row => row._id === rowID);
		if (!row) { return };
		mergeObject(row, changes);
		await user.setFlag(__ID__, dataFlag, userData);
		this.render({ userUpdated: userID });
		this.triggerListeners();
	};

	static async deleteRow(tableID, userID, rowID) {
		const table = await this.getTable(tableID);
		if (!table) {
			Logger.error(`Cannot find the table with ID "${tableID}"`);
			return;
		};

		const user = game.users.get(userID);
		if (!user) {
			Logger.error(`Can't find the user with ID "${tableID}"`);
			return;
		};

		const userData = user.getFlag(__ID__, dataFlag) ?? {};
		let rowIndex = userData[tableID]?.findIndex(row => row._id === rowID);
		if (rowIndex === -1) { return };
		userData[tableID].splice(rowIndex, 1);
		await user.setFlag(__ID__, dataFlag, userData);
		this.render({ userUpdated: userID });
		this.triggerListeners();
	};

	// MARK: Listeners
	static #listener = null;
	static async registerListeners() {
		if (this.#listener !== null) { return };

		this.#listener = Hooks.on(`updateUser`, (doc, diff, options, userID) => {
			Logger.debug({ diff, userID, doc });
			// Shortcircuit when on the client that triggered the update
			if (userID === game.user.id) { return };
			if (!hasProperty(diff, `flags.${__ID__}.${dataFlag}`)) { return };
			this.render({ userUpdated: doc.id });
		});
	};

	static async triggerListeners() {
		// No-op because the User document lifecycle takes care of it
	};

	static async unregisterListeners() {
		Hooks.off(`updateUser`, this.#listener);
		this.#listener = null;
	};
};
