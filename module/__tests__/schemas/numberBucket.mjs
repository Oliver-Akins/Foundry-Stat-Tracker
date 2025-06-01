import { api } from "../../api.mjs";

export function numberBucketTests(quench) {
	quench.registerBatch(
		`${__ID__}.numberBucketSchema`,
		(ctx) => {
			const { describe, it, expect } = ctx;

			describe(`the number bucket schema`, () => {
				it(`should allow all additional properties to be left out`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number` },
					);
					expect(error).to.be.undefined;
				});

				it(`should allow the min additional property if only it is provided with the type`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, min: 0 },
					);
					expect(error).to.be.undefined;
				});

				it(`should allow the max additional property if only it is provided with the type`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, max: 10 },
					);
					expect(error).to.be.undefined;
				});

				it(`should not allow the step additional property if only it is provided with the type`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, step: 1 },
					);
					expect(error).not.to.be.undefined;
				});

				it(`should not allow max to be less than min`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, min: 10, max: 5 },
					);
					expect(error).not.to.be.undefined;
				});

				it(`should not allow max to be less than min`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, min: 10, max: 15 },
					);
					expect(error).to.be.undefined;
				});

				it(`should allow step when min is also provided`, () => {
					const { error } = api.schemas.buckets.number.validate(
						{ type: `number`, min: 10, step: 5 },
					);
					expect(error).to.be.undefined;
				});
			});
		},
	);
};
