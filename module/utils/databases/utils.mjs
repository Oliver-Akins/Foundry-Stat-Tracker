export function createDiceTable(size) {
	return {
		name: `Dice/d${size}`,
		buckets: {
			type: `range`,
			min: 1,
			max: size,
			step: 1,
		},
		graph: {
			type: `bar`,
			stacked: true,
		},
	};
};
