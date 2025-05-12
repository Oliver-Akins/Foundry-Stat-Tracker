import { BucketTypes } from "../utils/buckets.mjs";
import { diceSizeSorter } from "../utils/sorters/diceSize.mjs";
import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { smallToLarge } from "../utils/sorters/smallToLarge.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { isEmpty } = foundry.utils;

export class TableManager extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		tag: `form`,
		classes: [
			__ID__,
			`TableManager`,
		],
		window: {
			title: `Table Manager`,
			frame: true,
			positioned: true,
			resizable: true,
			minimizable: true,
			contentClasses: [`st-scrollable`],
			controls: [
				// Add action for deleting the table
			],
		},
		position: {
			width: 475,
			height: 440,
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: this.#submit,
		},
		actions: {},
	};

	static PARTS = {
		tableSelect: {
			template: filePath(`templates/Apps/common/tableSelect.hbs`),
		},
		buckets: {
			template: filePath(`templates/Apps/TableManager/buckets.hbs`),
			templates: [
				filePath(`templates/Apps/TableManager/buckets/empty.hbs`),
				...Object.values(BucketTypes).map(
					(bucketType) => filePath(`templates/Apps/TableManager/buckets/${bucketType}.hbs`),
				),
			],
		},
		submit: {
			template: filePath(`templates/Apps/TableManager/submit.hbs`),
		},
	};
	// #endregion Options

	// #region Selected Table
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
	// #endregion Selected Table

	// #region Lifecycle
	async render({ userUpdated, ...opts } = {}) {
		if (userUpdated) {
			return;
		};
		await super.render(opts);
	};

	async _onRender(context, options) {
		await super._onRender(context, options);

		const elements = this.element
			.querySelectorAll(`[data-bind]`);
		for (const input of elements) {
			input.addEventListener(`change`, this.#bindListener.bind(this));
		};
	};

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		CONFIG.stats.db.addApp(this);
	};

	_tearDown() {
		CONFIG.stats.db.removeApp(this);
		return super._tearDown();
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
				await this.#prepareTableSelectContext(ctx);
				break;
			};
			case `buckets`: {
				await this.#prepareBucketContext(ctx);
				break;
			};
		};

		if (import.meta.env.DEV) {
			Logger.log(partId, `context`, ctx);
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

	async #prepareBucketContext(ctx) {
		const table = await CONFIG.stats.db.getTable(this.activeTableID);
		const type = table?.buckets?.type ?? `empty`;

		const template = filePath(`templates/Apps/TableManager/buckets/${type}.hbs`);
		ctx.buckets = {
			locked: false,
			template,
			classes: ``,
		};

		if (!table) {
			ctx.buckets.classes = `alert-box warning center`;
			return;
		};

		const locked = this._selectedTable === `Dice` || table.buckets.locked;
		ctx.buckets.locked = locked;
		if (locked) {
			ctx.buckets.classes = `alert-box locked`;
		};

		const capitalizedType = type[0].toUpperCase() + type.slice(1);
		if (!this[`_prepare${capitalizedType}Context`]) { return };
		this[`_prepare${capitalizedType}Context`](ctx, table);
	};

	async _prepareNumberContext(ctx, table) {
		ctx.buckets.min = table.buckets.min;
		ctx.buckets.max = table.buckets.max;
		ctx.buckets.step = table.buckets.step;
	};

	async _prepareRangeContext(ctx, table) {
		ctx.buckets.min = table.buckets.min;
		ctx.buckets.max = table.buckets.max;
		ctx.buckets.step = table.buckets.step;
	};

	async _prepareStringContext(ctx, table) {
		ctx.buckets.choices = [...table.buckets.choices];
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

	/**
	 * Process form submission for the sheet.
	 * @this {DocumentSheetV2} The handler is called with the application as its bound scope
	 * @param {SubmitEvent} event The originating form submission event
	 * @param {HTMLFormElement} form The form element that was submitted
	 * @param {FormDataExtended} formData Processed data for the submitted form
	 * @param {object} [options] Additional options provided by a manual submit call. All options except `options.updateData` are forwarded along to _processSubmitData.
	 * @param {object} [options.updateData] Additional data passed in if this form is submitted manually which should be merged with prepared formData.
	 * @returns {Promise<void>}
	 */
	static async #submit(_event, _form, formData, _options) {
		if (isEmpty(formData.object)) {
			ui.notifications.info(`Nothing to save`);
			return;
		}
		await CONFIG.stats.db.updateTable(this.activeTableID, formData.object);
	};
	// #endregion Actions
};
