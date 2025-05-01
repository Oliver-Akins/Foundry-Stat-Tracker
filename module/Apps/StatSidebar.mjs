import { filePath } from "../consts.mjs";
import { StatsViewer } from "./StatsViewer.mjs";

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

		return ctx;
	};

	/** @this {StatSidebar} */
	static async #openStats() {
		const app = new StatsViewer();
		app.render({ force: true });
	};
};
