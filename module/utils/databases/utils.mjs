export function createDiceTable(size) {
	return {
		name: `Dice/d${size}`,
		buckets: {
			type: `number`,
			min: 1,
			max: size,
			step: 1,
		},
		graph: {
			type: `bar`,
			stacked: true,
			showEmptyBuckets: true,
		},
	};
};
