import { filePath } from "../consts.mjs";
import { StatsViewer } from "./StatsViewer.mjs";
import { TableCreator } from "./TableCreator.mjs";

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
		const db = CONFIG.StatsDatabase;

		ctx.tableCount = db.getTables().length;

		const controls = {
			openStats: { label: `View Stats`, action: `openStats` },
			createTable: { label: `Create New Table`, action: `createTable` },
			manageTables: { label: `Manage Tables`, action: `` },
			manageData: { label: `Manage Data`, action: `` },
		};

		if (!game.user.isGM) {
			delete controls.createTable;
			delete controls.manageTables;
		};

		const canManageTheirOwnData = false;
		if (!game.user.isGM && !canManageTheirOwnData) {
			delete controls.manageData;
		};

		Hooks.callAll(`${__ID__}.getStatsSidebarControls`, controls);
		ctx.controls = Object.values(controls);

		return ctx;
	};

	/** @this {StatSidebar} */
	static async #openStats() {
		const app = new StatsViewer();
		app.render({ force: true });
	};

	/** @this {StatSidebar} */
	static async #createTable() {
		const app = new TableCreator;
		app.render({ force: true });
	};
};
