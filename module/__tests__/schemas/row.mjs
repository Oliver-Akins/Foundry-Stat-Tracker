import { api } from "../../api.mjs";
import { PrivacyMode } from "../../utils/privacy.mjs";

export function rowTests(quench) {
	quench.registerBatch(
		`${__ID__}.rowSchema`,
		(ctx) => {
			const { describe, it, expect } = ctx;

			describe(`the row schema`, () => {
				it(`should allow number-based values`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toISOString(),
							value: 1,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).to.be.undefined;
				});

				it(`should allow string-based values`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toISOString(),
							value: `apple`,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).to.be.undefined;
				});

				it(`shouldn't allow invalid privacy modes`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toISOString(),
							value: 1,
							privacy: `yahaha`,
						},
					);
					expect(error).not.to.be.undefined;
				});

				it(`shouldn't allow invalid value modes`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toISOString(),
							value: true,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).not.to.be.undefined;
				});

				it(`shouldn't allow non-ISO date formats`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toDateString(),
							value: 1,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).not.to.be.undefined;
				});

				it(`should require an ID to be present`, () => {
					const { error } = api.schemas.row.validate(
						{
							timestamp: (new Date()).toISOString(),
							value: true,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).not.to.be.undefined;
				});

				it(`shouldn't allow empty string as a value`, () => {
					const { error } = api.schemas.row.validate(
						{
							_id: `1`,
							timestamp: (new Date()).toISOString(),
							value: ``,
							privacy: PrivacyMode.PUBLIC,
						},
					);
					expect(error).not.to.be.undefined;
				});
			});
		},
	);
};
