import { Chart } from "chart.js";
import { diceSizeSorter } from "../utils/sorters/diceSize.mjs";
import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { PrivacyMode } from "../utils/privacy.mjs";
import { smallToLarge } from "../utils/sorters/smallToLarge.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class StatsViewer extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`StatsViewer`,
		],
		window: {
			title: `Stat Viewer`,
			frame: true,
			positioned: true,
			resizable: true,
			minimizable: true,
			controls: [
				{
					label: `Add All Users To Graph`,
					action: `addAllUsers`,
				},
			],
		},
		position: {
			width: 475,
			height: 440,
		},
		actions: {
			addAllUsers: this.#addAllUsers,
		},
	};

	static PARTS = {
		tableSelect: {
			template: filePath(`templates/Apps/common/tableSelect.hbs`),
		},
		dataFilters: {
			template: filePath(`templates/Apps/StatsViewer/dataFilters.hbs`),
		},
		graph: {
			template: filePath(`templates/Apps/StatsViewer/graph.hbs`),
		},
	};
	// #endregion

	// #region Instance Data
	constructor({ users, privacy, ...opts } = {}) {
		super(opts);

		if (users != null) {
			this._selectedUsers = users;
		};
		if (privacy != null && Array.isArray(privacy)) {
			this._privacySetting = privacy;
		};
	};

	_selectedUsers = [game.user.id];
	_graphData = null;
	_privacySetting = [PrivacyMode.PUBLIC, PrivacyMode.PRIVATE];

	#_selectedTable = ``;
	_selectedSubtable = ``;
	get _selectedTable() {
		return this.#_selectedTable;
	};
	set _selectedTable(val) {
		this.#_selectedTable = val;
		this._selectedSubtable = ``;
	};

	get activeTableID() {
		if (this._selectedSubtable) {
			return `${this._selectedTable}/${this._selectedSubtable}`;
		}
		return this._selectedTable;
	};
	// #endregion Instance Data

	// #region Lifecycle
	async render({ userUpdated, ...opts } = {}, _options) {
		if (userUpdated && !this._selectedUsers.includes(userUpdated)) {
			return;
		}
		await super.render(opts, _options);
	};

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		CONFIG.stats.db.addApp(this);
	};

	async _onRender(context, options) {
		await super._onRender(context, options);

		const elements = this.element
			.querySelectorAll(`[data-bind]`);
		for (const input of elements) {
			input.addEventListener(`change`, this.#bindListener.bind(this));
		};

		if (options.parts.includes(`graph`) && this._graphData) {
			const canvas = this.element.querySelector(`canvas`);
			new Chart( canvas, this._graphData );
		};
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _preparePartContext(partId) {
		const ctx = {
			table: this._selectedTable,
			subtable: this._selectedSubtable,
		};
		ctx.meta = {
			idp: this.id,
		};

		switch (partId) {
			case `tableSelect`: {
				this.#prepareTableSelectContext(ctx);
				break;
			};
			case `dataFilters`: {
				this.#prepareDataFiltersContext(ctx);
				break;
			};
			case `graph`: {
				this.#prepareGraphContext(ctx);
				break;
			};
		};

		if (import.meta.env.DEV) {
			Logger.log(`Context`, ctx);
		};
		return ctx;
	};

	async #prepareTableSelectContext(ctx) {
		const tables = new Set();
		const subtables = {};

		for (const tableConfig of await CONFIG.stats.db.getTables()) {
			const [ table, subtable ] = tableConfig.name.split(`/`);
			tables.add(table);
			if (subtable?.length > 0) {
				subtables[table] ??= [];
				subtables[table].push(subtable);
			};
		};

		const tableList = Array.from(tables);
		ctx.table = this._selectedTable;
		ctx.tables = tableList;

		const subtableList = subtables[this._selectedTable];

		// Sort the subtables to be sane
		if (this._selectedTable === `Dice`) {
			subtableList?.sort(diceSizeSorter);
		} else {
			subtableList?.sort(smallToLarge);
		};

		ctx.subtable = this._selectedSubtable;
		ctx.subtables = subtableList;
	};

	async #prepareDataFiltersContext(ctx) {
		ctx.users = [];
		ctx.selectedUsers = this._selectedUsers;
		for (const user of game.users) {
			ctx.users.push({
				label: user.name,
				value: user.id,
			});
		};

		ctx.privacySetting = this._privacySetting;
		ctx.privacyOptions = [
			{ label: `Self`, value: PrivacyMode.SELF },
			{ label: `Private`, value: PrivacyMode.PRIVATE },
			{ label: `Public`, value: PrivacyMode.PUBLIC },
		];
		if (game.user.isGM) {
			ctx.privacyOptions.push(
				{ label: `Blind`, value: PrivacyMode.GM },
			);
		};
	};

	async #prepareGraphContext(ctx) {
		const table = await CONFIG.stats.db.getTable(this.activeTableID);
		if (!table) {
			this._graphData = null;
			ctx.showGraph = false;
			ctx.classes = `alert-box warning`;
			return;
		};
		ctx.classes = ``;
		ctx.showGraph = true;

		const userData = await CONFIG.stats.db.getRows(
			this.activeTableID,
			this._selectedUsers,
			this._privacySetting,
		);

		const data = {};
		const allBuckets = new Set();

		/*
		When we're displaying data for a table within the Dice namespace, we want to
		include all values that any user might not have rolled, just for completeness
		since we do know exactly what labels to display, this might eventually be
		replaced with a per-table configuration setting to determine what values are
		populated within the graph and nothing else / prevent non-accepted values
		from being added to the table in the first place.
		*/
		if (this._selectedTable === `Dice`) {
			const size = Number.parseInt(this._selectedSubtable.slice(1));
			for (let i = 1; i <= size; i++) {
				allBuckets.add(i);
			};
		};

		for (const user of this._selectedUsers) {
			const buckets = {};
			for (const row of userData[user] ?? []) {
				buckets[row.value] ??= 0;
				buckets[row.value] += 1;
				allBuckets.add(row.value);
			};
			data[user] = buckets;
		}

		const sortedBucketNames = Array.from(allBuckets).sort(smallToLarge);
		const datasets = {};
		for (const bucket of sortedBucketNames) {
			for (const user of this._selectedUsers) {
				datasets[user] ??= [];
				datasets[user].push(data[user][bucket] ?? 0);
			};
		};

		this._graphData = {
			type: table.graph.type,
			options: {
				// this must be true because it won't downsize the graph when false
				maintainAspectRatio: true,
				animation: false,
				scales: {
					y: {
						stacked: table.graph?.stacked ?? false,
					},
					x: {
						stacked: table.graph?.stacked ?? false,
					},
				},
				plugins: {
					legend: {
						onClick: null,
					},
				},
			},
			data: {
				labels: sortedBucketNames,
				datasets: Object.entries(datasets).map(([userID, values]) => {
					const user = game.users.get(userID);
					return {
						label: user.name,
						data: values,
						borderWidth: 2,
						borderColor: user.color.css,
						backgroundColor: user.color.toRGBA(0.5),
					};
				}),
			},
		};
	};
	// #endregion Data Prep

	// #region Actions
	/**
	 * @param {Event} event
	 */
	async #bindListener(event) {
		const target = event.target;
		const data = target.dataset;
		const binding = data.bind;

		if (import.meta.env.DEV) {
			Logger.debug(`updating ${binding} value to ${target.value}`);
		}
		Reflect.set(this, binding, target.value);
		this.render();
	};

	/** @this {StatsViewer} */
	static async #addAllUsers() {};
	// #endregion Actions
};
