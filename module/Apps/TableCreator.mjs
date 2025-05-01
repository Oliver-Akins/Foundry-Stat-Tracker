import { BucketTypes } from "../utils/validateValue.mjs";
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
			height: 206,
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

	_name = ``;
	_type = BucketTypes.NUMBER;
	async _preparePartContext(partId) {
		const ctx = {};
		ctx.meta = {
			idp: this.id,
		};

		ctx.name = this._name;
		ctx.type = this._type;
		ctx.types = Object.values(BucketTypes);

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
		if (this._name === ``) {
			ui.notifications.error(`Cannot create a table without a name`);
		};
	};
};
