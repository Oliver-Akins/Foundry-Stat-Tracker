import { Logger } from "./Logger.mjs";

const { deepClone } = foundry.utils;
const { StringField, NumberField } = foundry.data.fields;

export const BucketTypes = {
	STRING: `string`,
	NUMBER: `number`,
	RANGE: `range`,
};

/**
 * @param {unknown} value The value to validate
 * @param {BucketConfig} options The bucket config for the table
 * @returns Whether or not the value is valid for the table
 */
export function validateValue(value, options) {
	/** @type {BucketConfig} */
	let opts = deepClone(options);

	const validator = validators[opts.type];
	if (validator == null) {
		Logger.error(`Failed to find type validator for: ${opts.type}`);
		return false;
	};

	// Disallow function choices if present
	if (typeof opts.choices === `function`) {
		delete opts.choices;
	};

	// Get ride of properties that aren't part of the data fields
	delete opts.type;
	delete opts.locked;

	validator.transformOptions(opts);

	const field = new validator.field(opts);
	const error = field.validate(value);

	// DataFields return a class instance on error, or void when valid.
	return !error;
};

/**
 * @param {BucketConfig} config The bucket config for the table
 * @returns {BucketConfig} The transformed bucket config
 */
export function validateBucketConfig(config) {
	/** @type {BucketConfig} */
	let conf = deepClone(config);

	const validator = validators[conf.type];
	if (validator == null) {
		Logger.error(`Failed to find type validator for: ${conf.type}`);
		return false;
	};

	// Disallow function choices if present
	if (typeof conf.choices === `function`) {
		Logger.error(`Choices cannot be a function in a table's buckets configuraion`);
		delete conf.choices;
	};

	validator.validateConfig(conf);

	return conf;
};

const validators = {
	[BucketTypes.STRING]: {
		field: StringField,
		transformOptions: (opts) => {
			opts.nullable = false;
			opts.trim = true;
			opts.blank = false;
		},
		validateConfig: (config) => {
			if (config.choices.length === 0) {
				delete config.choices;
				config[`-=choices`] = null;
			};
		},
	},
	[BucketTypes.NUMBER]: {
		field: NumberField,
		transformOptions: transformNumberFieldOptions,
		validateConfig: (config) => {
			if (config.step != null && config.min == null) {
				delete config.step;
				config[`-=step`] = null;
			};
			if (
				config.min != null
				&& config.max != null
				&& config.min > config.max
			) {
				throw new Error(`"min" must be less than "max"`);
			}
		},
	},
	[BucketTypes.RANGE]: {
		field: NumberField,
		transformOptions: transformNumberFieldOptions,
		validateConfig: (config) => {
			if (config.min == null) {
				throw new Error(`"min" must be defined for range buckets`);
			};
			if (config.max == null) {
				throw new Error(`"max" must be defined for range buckets`);
			};
			if (config.min > config.max) {
				throw new Error(`"min" must be less than "max"`);
			}
			config.step ??= 1;
		},
	},
};

function transformNumberFieldOptions(opts) {
	opts.nullable = false;
	opts.integer = true;
};
