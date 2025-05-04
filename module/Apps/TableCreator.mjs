import { BucketTypes } from "../utils/validateValue.mjs";
import { createDiceTable } from "../utils/databases/utils.mjs";
import { filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class TableCreator extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`TableCreator`,
		],
		window: {
			title: `Create Table`,
			frame: true,
			positioned: true,
			resizable: false,
			minimizable: true,
		},
		position: {
			width: 320,
			height: `auto`,
		},
		actions: {
			createTable: this.#createTable,
		},
	};

	static PARTS = {
		tableSelect: {
			template: filePath(`templates/Apps/TableCreator.hbs`),
			root: true,
		},
	};
	// #endregion

	async render({ userUpdated, ...opts } = {}) {
		if (userUpdated && !this._selectedUsers.includes(userUpdated)) {
			return;
		}
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

	/** @type {string} */
	_name = ``;
	/** @type {string} */
	_type = BucketTypes.NUMBER;
	#diceNamespaceAlert = null;
	async _preparePartContext() {
		const ctx = {};
		ctx.meta = {
			idp: this.id,
		};

		ctx.name = this._name;
		ctx.type = this._type;
		ctx.typeDisabled = false;
		ctx.types = Object.values(BucketTypes);

		// Special Case for the dice namespace
		if (this._name.startsWith(`Dice`)) {
			ctx.typeDisabled = true;
			ctx.type = BucketTypes.RANGE;
			this.#diceNamespaceAlert = ui.notifications.info(
				`Tables in the "Dice" namespace must be formatted as "Dice/dX" where X is the number of sides on the die and are restricted to be ranges 1 to X.`,
				{ permanent: true },
			);
		} else if (this.#diceNamespaceAlert != null) {
			ui.notifications.remove(this.#diceNamespaceAlert);
		};

		if (import.meta.env.DEV) {
			Logger.log(`Context`, ctx);
		};
		return ctx;
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

	static async #createTable() {
		/** @type {string} */
		const name = this._name;
		if (name === ``) {
			ui.notifications.error(`Cannot create a table without a name`);
		};

		const existing = CONFIG.stats.db.getTable(name);
		if (existing) {
			ui.notifications.error(`A table with the name "${name}" already exists`);
		};

		if (name.startsWith(`Dice`)) {
			if (!name.match(/^Dice\/d[0-9]+$/)) {
				ui.notifications.error(`Table name doesn't conform to the "Dice/dX" format required by the Dice namespace.`);
				return;
			};
			const size = Number(name.replace(`Dice/d`, ``));
			CONFIG.stats.db.createTable(createDiceTable(size));
			return;
		};
	};
};
