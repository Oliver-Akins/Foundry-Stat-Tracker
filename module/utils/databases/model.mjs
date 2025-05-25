import * as Joi from "joi";
import { PrivacyMode } from "../privacy.mjs";

// MARK: Buckets
export const numberBucketSchema = Joi.object({
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

export const stringBucketSchema = Joi.object({
	type: Joi.string().valid(`string`).required(),
	choices: Joi
		.array()
		.items(
			Joi.string().trim().invalid(``),
		)
		.optional(),
});

// MARK: Graphs
export const barGraphSchema = Joi.object({
	type: Joi.string().valid(`bar`).required(),
	stacked: Joi
		.boolean()
		.default(true)
		.optional(),
});

// MARK: Table
export const tableSchema = Joi.object({
	name: Joi
		.string()
		.trim()
		.invalid(``)
		.required()
		.pattern(/^[0-9a-z \-_]+(\/[0-9a-z \-_]+)?$/i),
	buckets: Joi
		.alternatives()
		.try(
			numberBucketSchema,
			stringBucketSchema,
		)
		.match(`one`)
		.required(),
	graph: Joi
		.alternatives()
		.try(
			barGraphSchema,
		)
		.match(`one`)
		.required(),
});

// MARK: Row
/**
 * The schema for the row objects, this does not validate that the
 * value of the row conforms to the bucket configurations, however
 * it does validate that the value is at least one of the accepted
 * types. For validation of the value itself check "validateValue"
 * in `utils/buckets.mjs`
 */
export const rowSchema = Joi.object({
	_id: Joi
		.string()
		.alphanum()
		.required(),
	timestamp: Joi
		.string()
		.isoDate()
		.required(),
	value: Joi
		.alternatives([
			Joi.string().trim().invalid(``),
			Joi.number(),
		])
		.required(),
	privacy: Joi
		.string()
		.valid(...Object.values(PrivacyMode))
		.required(),
});
