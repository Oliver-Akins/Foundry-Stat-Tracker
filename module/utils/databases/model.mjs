import * as Joi from "joi";

// MARK: Buckets
const numberBucketSchema = Joi.object({
	type: Joi.string().valid(`number`, `range`).required(),
	min: Joi
		.number()
		.integer()
		.when(`type`, {
			is: Joi.string().valid(`range`),
			then: Joi.required(),
			otherwise: Joi.optional(),
		}),
	max: Joi
		.number()
		.integer()
		.when(`type`, {
			is: Joi.string().valid(`range`),
			then: Joi.required(),
			otherwise: Joi.optional(),
		}),
	step: Joi
		.number()
		.integer()
		.when(`type`, {
			is: Joi.string().valid(`range`),
			then: Joi.required(),
			otherwise: Joi.optional(),
		}),
});

const stringBucketSchema = Joi.object({
	type: Joi.string().valid(`string`).required(),
	choices: Joi.array(Joi.string()).optional(),
});

// MARK: Graphs
const barGraphSchema = Joi.object({
	type: Joi.string().valid(`bar`).required(),
	stacked: Joi.boolean().required(),
});

// MARK: Table
export const tableSchema = Joi.object({
	name: Joi
		.string()
		.trim()
		.required()
		.pattern(/^[a-z \-_]+(\/[a-z \-_]+)?$/i),
	buckets: Joi.alternatives([
		numberBucketSchema,
		stringBucketSchema,
	]).match(`one`),
	graph: Joi.alternatives([
		barGraphSchema,
	]).match(`one`),
});

// MARK: Row
export const rowSchema = Joi.object({});
