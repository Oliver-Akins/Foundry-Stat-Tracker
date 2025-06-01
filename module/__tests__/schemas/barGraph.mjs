import { api } from "../../api.mjs";

export function barGraphTests(quench) {
	quench.registerBatch(
		`${__ID__}.barGraphSchema`,
		(ctx) => {
			const { describe, it, expect } = ctx;

			describe(`the bar graph schema`, () => {
				it(`should default any additional properties left out`, () => {
					const { value, error } = api.schemas.graphs.bar.validate(
						{ type: `bar` },
					);
					expect(value).to.have.keys(`type`, `stacked`, `showEmptyBuckets`);
					expect(error).to.be.undefined;
				});

				it(`should allow stacked to be provided specifically`, () => {
					const { value, error } = api.schemas.graphs.bar.validate(
						{ type: `bar`, stacked: true },
					);
					expect(value).to.have.keys(`type`, `stacked`, `showEmptyBuckets`);
					expect(error).to.be.undefined;
				});

				it(`should allow showEmptyBuckets to be provided specifically`, () => {
					const { value, error } = api.schemas.graphs.bar.validate(
						{ type: `bar`, showEmptyBuckets: true },
					);
					expect(value).to.have.keys(`type`, `stacked`, `showEmptyBuckets`);
					expect(error).to.be.undefined;
				});

				it(`should only allow showEmptyBuckets to be a boolean`, () => {
					const { value, error } = api.schemas.graphs.bar.validate(
						{ type: `bar`, showEmptyBuckets: `a potato` },
					);
					expect(value).to.have.keys(`type`, `stacked`, `showEmptyBuckets`);
					expect(error).not.to.be.undefined;
				});

				it(`should only allow stacked to be a boolean`, () => {
					const { error } = api.schemas.graphs.bar.validate(
						{ type: `bar`, stacked: `a potato` },
					);
					expect(error).not.to.be.undefined;
				});
			});
		},
	);
};
