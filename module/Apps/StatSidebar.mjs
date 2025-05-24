import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { PrivacyMode } from "../utils/privacy.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;
const { getType } = foundry.utils;

export class StatSidebar extends HandlebarsApplicationMixin(AbstractSidebarTab) {
	// #region Options
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
			openApp: this.#openApp,
		},
	};

	/** @override */
	static tabName = `stats`;

	/** @override */
	static PARTS = {
		// stats: {
		// 	template: filePath(`templates/Apps/StatSidebar/main.hbs`),
		// 	root: true,
		// },
		summaryText: {
			template: filePath(`templates/Apps/StatSidebar/.hbs`),
		},
		summaryGraph: {
			template: filePath(`templates/Apps/StatSidebar/.hbs`),
		},
		appControls: {
			template: filePath(`templates/Apps/StatSidebar/controlSection.hbs`),
		},
	};
	// #endregion Options

	// #region Lifecycle
	async render(options, _options) {
		const { userUpdated = null } = (getType(options) === `Object` ? options : _options) ?? {};
		if (userUpdated && userUpdated !== game.user.id) {
			// TODO: Update the data in the graph
			return;
		};
		return super.render(options, _options);
	};

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		CONFIG.stats.db.addApp(this);
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _preparePartContext(context, options) {
		const ctx = await super._prepareContext(options);

		this.#prepareApps(ctx);

		return ctx;
	};

	async #prepareSummary(ctx) {
		const db = CONFIG.stats.db;

		const tables = await db.getTables();
		ctx.tableCount = tables.length;
		ctx.rowCount = {
			total: 0,
			public: 0,
			self: 0,
			private: 0,
			gm: 0,
		};
		for (const table of tables) {
			const rows = await db.getRows(table.name, [game.user.id], Object.values(PrivacyMode));
			for (const row of rows[game.user.id] ?? []) {
				ctx.rowCount[row.privacy]++;
				ctx.rowCount.total++;
			};
		};
	};

	async #prepareApps(ctx) {
		const controls = {
			openStats: { label: `View Stats`, action: `openApp`, appKey: `viewer` },
			createTable: { label: `Create New Table`, action: `openApp`, appKey: `creator` },
			manageTables: { label: `Manage Tables`, action: `openApp`, appKey: `tableManager` },
			// manageData: { label: `Manage Data`, action: `openApp`, appKey: `rowManager` },
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

		Hooks.callAll(`${__ID__}.getStatsSidebarApps`, controls);
		ctx.controls = Object.values(controls);
	};
	// #endregion Data Prep

	// #region Actions
	static async #openApp(target) {
		const { appKey } = target.dataset;
		const cls = CONFIG.stats[appKey];
		if (!(cls.prototype instanceof ApplicationV2)) {
			Logger.error(`Cannot create an app from`, cls);
			return;
		};
		const app = new cls();
		app.render({ force: true });
	};
	// #endregion Actions
};
