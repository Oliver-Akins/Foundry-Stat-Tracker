import * as Joi from "joi";
import { PrivacyMode } from "../privacy.mjs";

// MARK: Buckets
export const numberBucketSchema = Joi.object({
	type: Joi.string().valid(`number`).required(),
	min: Joi
		.number()
		.integer()
		.when(`step`, {
			is: Joi.exist(),
			then: Joi.required(),
		}),
	max: Joi
		.number()
		.integer()
		.when(`min`, {
			is: Joi.exist(),
			then: Joi.number().greater(Joi.ref(`min`)),
		}),
	step: Joi
		.number()
		.integer()
		.min(1),
});

export const stringBucketSchema = Joi.object({
	type: Joi.string().valid(`string`).required(),
	choices: Joi
		.array()
		.items(
			Joi.string().trim().invalid(``),
		)
		.min(1)
		.optional(),
});

// MARK: Graphs
export const barGraphSchema = Joi.object({
	type: Joi.string().valid(`bar`).required(),
	stacked: Joi.boolean().optional().default(true),
	showEmptyBuckets: Joi.boolean().optional().default(false),
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
		.conditional(
			`/buckets.type`,
			{
				switch: [
					{
						is: `number`,
						then: numberBucketSchema,
					},
					{
						is: `string`,
						then: stringBucketSchema,
					},
				],
				otherwise: Joi.forbidden(),
			},
		)
		.required(),
	graph: Joi
		.alternatives()
		.conditional(
			`/graph.type`,
			{
				switch: [
					{ is: `bar`, then: barGraphSchema },
				],
				otherwise: Joi.forbidden(),
			},
		)
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
