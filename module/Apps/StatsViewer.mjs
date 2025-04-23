import { Chart } from "chart.js";
import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
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
		},
		position: {
			width: 475,
			height: 400,
		},
		actions: {},
	};

	static PARTS = {
		tableSelect: {
			template: filePath(`templates/Apps/StatsViewer/tableSelect.hbs`),
		},
		dataFilters: {
			template: filePath(`templates/Apps/StatsViewer/dataFilters.hbs`),
		},
		graph: {
			template: filePath(`templates/Apps/StatsViewer/graph.hbs`),
		},
		tableOverview: {
			template: filePath(`templates/Apps/StatsViewer/dataOverview.hbs`),
		},
	};
	// #endregion

	async _onRender(context, options) {
		await super._onRender(context, options);

		/*
		Removes the Foundry empty placeholder and allows my custom placeholder.
		See: https://github.com/foundryvtt/foundryvtt/issues/12572
		*/
		this.element.querySelector(`multi-select option:first-child:empty`)
			?.remove();

		const elements = this.element
			.querySelectorAll(`[data-bind]`);
		for (const input of elements) {
			input.addEventListener(`change`, this.#bindListener.bind(this));
		};

		if (options.parts.includes(`graph`)) {
			const canvas = this.element.querySelector(`canvas`);
			new Chart( canvas, this._graphData );
		};
	};

	async _preparePartContext(partId) {
		const ctx = {};

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

	_selectedTable;
	_selectedSubtable;
	async #prepareTableSelectContext(ctx) {
		const tables = new Set();
		const subtables = {};

		for (const tableConfig of CONFIG.StatsDatabase.getTables()) {
			const [ table, subtable ] = tableConfig.name.split(`/`);
			tables.add(table);
			if (subtable?.length > 0) {
				subtables[table] ??= [];
				subtables[table].push(subtable);
			};
		};

		const tableList = Array.from(tables);
		this._selectedTable ??= tableList[0];

		ctx.table = this._selectedTable;
		ctx.tables = tableList;

		const subtableList = subtables[this._selectedTable];
		if (!subtableList) {
			this._selectedSubtable = undefined;
		} else if (!subtableList.includes(this._selectedSubtable)) {
			this._selectedSubtable = subtableList?.[0];
		};
		ctx.subtable = this._selectedSubtable;
		ctx.subtables = subtableList;
	};

	_selectedUsers = [game.user.id];
	async #prepareDataFiltersContext(ctx) {
		ctx.users = [];
		ctx.selectedUsers = this._selectedUsers;
		for (const user of game.users) {
			ctx.users.push({
				label: user.name,
				value: user.id,
			});
		};
	};

	_graphData = {};
	async #prepareGraphContext(_ctx) {
		const userData = CONFIG.StatsDatabase.getRows(
			`${this._selectedTable}/${this._selectedSubtable}`,
			this._selectedUsers,
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
				datasets[user].push(data[user][bucket]);
			};
		};

		this._graphData = {
			type: `bar`,
			options: {
				scales: {
					y: {
						stacked: true,
					},
					x: {
						stacked: true,
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
						borderColor: user.color.css,
						backgroundColor: user.color.toRGBA(0.5),
						borderWidth: 2,
						borderRadius: 4,
						borderSkipped: false,
					};
				}),
			},
		};
	};

	/**
	 * @param {Event} event
	 */
	async #bindListener(event) {
		const target = event.target;
		const data = target.dataset;

		const binding = data.bind;
		if (!binding || !Object.hasOwn(this, binding)) {
			Logger.debug(`Skipping change for element with binding "${binding}"`);
			return;
		};

		Logger.log(`updating ${binding} value to ${target.value}`);
		this[binding] = target.value;
		this.render();
	};
};
