const { fields } = foundry.data;

// MARK: Table
export class Table extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			name: new fields.StringField({
				nullable: false,
				required: true,
				blank: false,
				trim: true,
				validate(value) {
					return !value.match(/[^a-z0-9_\-:]/i);
				},
			}),
			data: new fields.TypedObjectField(Row),
		};
	};
};

// MARK: Row
export class Row extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			id: new fields.StringField({
				nullable: false,
				required: true,
				blank: false,
			}),
			timestamp: new fields.NumberField({
				min: 0,
				required: true,
				nullable: false,
			}),
			value: new fields.AnyField(),
			private: new fields.BooleanField({
				initial: false,
				required: true,
				nullable: false,
			}),
		};
	};
};
