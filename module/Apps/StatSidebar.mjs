import { filePath } from "../consts.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;

export class StatSidebar extends HandlebarsApplicationMixin(AbstractSidebarTab) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`StatsSidebar`,
		],
		window: {
			title: `SIDEBAR.TabSettings`,
		},
		actions: {
			openStats: this.#openStats,
			manageTables: this.#manageTables,
			createTable: this.#createTable,
		},
	};

	/** @override */
	static tabName = `stats`;

	/** @override */
	static PARTS = {
		stats: {
			template: filePath(`templates/Apps/StatSidebar/main.hbs`),
			root: true,
		},
	};

	async _prepareContext(options) {
		const ctx = await super._prepareContext(options);
		const db = CONFIG.stats.db;

		ctx.tableCount = (await db.getTables()).length;

		const controls = {
			openStats: { label: `View Stats`, action: `openStats` },
			createTable: { label: `Create New Table`, action: `createTable` },
			manageTables: { label: `Manage Tables`, action: `manageTables` },
			// manageData: { label: `Manage Data`, action: `` },
		};

		if (!game.user.isGM) {
			delete controls.createTable;
			delete controls.manageTables;
		};

		// TODO: Add this back once row management is implemented
		// const canManageTheirOwnData = false;
		// if (!game.user.isGM && !canManageTheirOwnData) {
		// 	delete controls.manageData;
		// };

		Hooks.callAll(`${__ID__}.getStatsSidebarControls`, controls);
		ctx.controls = Object.values(controls);

		return ctx;
	};

	/** @this {StatSidebar} */
	static async #openStats() {
		const app = new CONFIG.stats.viewer;
		app.render({ force: true });
	};

	/** @this {StatSidebar} */
	static async #manageTables() {
		const app = new CONFIG.stats.manager;
		app.render({ force: true });
	};

	/** @this {StatSidebar} */
	static async #createTable() {
		const app = new CONFIG.stats.creator;
		app.render({ force: true });
	};
};
