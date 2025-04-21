/**
 * @typedef {object} Option
 * @property {string} [label]
 * @property {string|number} value
 * @property {boolean} [disabled]
 */

/**
 * @param {string | number | string[] | number[]} selected
 * @param {Array<Option | string>} opts
 * @param {any} meta
 */
export function options(selected, opts) {
	if (!Array.isArray(selected)) {
		selected = [selected];
	};
	// selected = selected.map(Handlebars.escapeExpression);
	const htmlOptions = [];

	for (let opt of opts) {
		if (typeof opt === `string`) {
			opt = { label: opt, value: opt };
		};
		opt.value = Handlebars.escapeExpression(opt.value);
		htmlOptions.push(
			`<option
				value="${opt.value}"
				${selected.includes(opt.value) ? `selected` : ``}
				${opt.disabled ? `disabled` : ``}
			>
				${ opt.label }
			</option>`,
		);
	};
	return new Handlebars.SafeString(htmlOptions.join(`\n`));
};
