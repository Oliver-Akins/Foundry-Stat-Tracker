import { api } from "../../api.mjs";

export function stringBucketTests(quench) {
	quench.registerBatch(
		`${__ID__}.stringBucketSchema`,
		(ctx) => {
			const { describe, it, expect } = ctx;

			describe(`the string bucket schema`, () => {
				it(`should allow all additional properties to be left out`, () => {
					const { error } = api.schemas.buckets.string.validate(
						{ type: `string` },
					);
					expect(error).to.be.undefined;
				});

				it(`should allow specific choices to be provided`, () => {
					const { error } = api.schemas.buckets.string.validate(
						{ type: `string`, choices: [`choice 1`, `choice 2`] },
					);
					expect(error).to.be.undefined;
				});

				it(`shouldn't allow specific choices to be empty`, () => {
					const { error } = api.schemas.buckets.string.validate(
						{ type: `string`, choices: [] },
					);
					expect(error).not.to.be.undefined;
				});

				it(`should only allow specific choices to be strings`, () => {
					const { error } = api.schemas.buckets.string.validate(
						{ type: `string`, choices: [`choice 1`, 5] },
					);
					expect(error).not.to.be.undefined;
				});
			});
		},
	);
};
