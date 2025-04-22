import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";

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
			height: 315,
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
		// this.#updatePartContainingElement(target);
	};

	/**
	 * @param { HTMLElement } element
	 */
	#updatePartContainingElement(element) {
		const partRoot = element.closest(`[data-application-part]`);
		if (!partRoot) { return };
		const data = partRoot.dataset;
		const partId = data.applicationPart;
		this.render({ parts: [partId] });
	};
};
