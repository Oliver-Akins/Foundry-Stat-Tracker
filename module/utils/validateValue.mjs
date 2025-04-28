import { Logger } from "./Logger.mjs";

const { deepClone } = foundry.utils;
const { StringField, NumberField } = foundry.data.fields;

export function validateValue(value, options) {
	let opts = deepClone(options);
	if (validatorTypes[opts.type] == null) {
		Logger.error(`Failed to find type validator for: ${opts.type}`);
		return false;
	};

	const validator = validatorTypes[opts.type];
	validator.transformOptions(opts);

	const field = new validator.field(opts);
	const error = field.validate(value);

	// DataFields return a class instance on error, or void when valid.
	return !error;
};

const validatorTypes = {
	string: {
		field: StringField,
		transformOptions: (opts) => {
			delete opts.type;
			opts.nullable = false;
			opts.trim = true;
			opts.blank = false;
			if (typeof opts.choices === `function`) {
				Logger.error(`Choices cannot be a function in a table's buckets configuraion`);
				delete opts.choices;
			};
		},
	},
	number: {
		field: NumberField,
		transformOptions: (opts) => {
			delete opts.type;
			opts.nullable = false;
			opts.integer = true;
		},
	},
	range: {
		field: NumberField,
		transformOptions: (opts) => {
			delete opts.type;
			opts.nullable = false;
			opts.integer = true;
		},
	},
};
