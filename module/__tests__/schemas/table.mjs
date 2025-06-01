import { api } from "../../api.mjs";

const graph = { type: `bar` };
const buckets = { type: `string` };

export function tableTests(quench) {
	quench.registerBatch(
		`${__ID__}.tableSchema`,
		(ctx) => {
			const { describe, it, expect } = ctx;

			describe(`the table schema`, () => {
				it(`should require that name be a non-empty string`, () => {
					const { error } = api.schemas.table.validate(
						{ name: ``, graph, buckets },
					);
					expect(error).not.to.be.undefined;
				});

				it(`should require that name only contain alphanumeric characters`, () => {
					const { error } = api.schemas.table.validate(
						{ name: `:(`, graph, buckets },
					);
					expect(error).not.to.be.undefined;
				});

				it(`should allow the name to contain spaces`, () => {
					const { error } = api.schemas.table.validate(
						{ name: `a name with spaces`, graph, buckets },
					);
					expect(error).to.be.undefined;
				});

				it(`should allow a single forward slash for subtables`, () => {
					const { error } = api.schemas.table.validate(
						{ name: `Table/subtable`, graph, buckets },
					);
					expect(error).to.be.undefined;
				});
			});
		},
	);
};
