import { Database } from "./Database.mjs";

/**
 * This database implemention is not recommended for any actual usage,
 * it is intended for overriding the current database implementation
 * when a non-conforming Database is provided as the CONFIG.stats.db
 * value in order to maintain the API interface for dependant modules
 * and systems.
 */
export class NilDatabase extends Database {
	// MARK: Table Ops
	static async createTable() {};
	static async getTables() {};
	static async getTable() {};
	static async updateTable() {};
	static async deleteTable() {};

	// MARK: Row Ops
	static async createRow() {};
	static async createRows() {};
	static async getRows() {};
	static async updateRow() {};
	static async deleteRow() {};

	// MARK: Applications
	static addApp() {};
	static removeApp() {};
	static async render() {};

	// MARK: Listeners
	static async registerListeners() {};
	static async triggerListeners() {};
	static async unregisterListeners() {};
};
