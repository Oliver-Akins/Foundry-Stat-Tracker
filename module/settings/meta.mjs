import { createDiceTable } from "../utils/databases/utils.mjs";

export function registerMetaSettings() {
	game.settings.register(__ID__, `tables`, {
		scope: `world`,
		type: Object,
		config: false,
		requiresReload: false,
		default: {
			"Dice/d4": createDiceTable(4),
			"Dice/d6": createDiceTable(6),
			"Dice/d8": createDiceTable(8),
			"Dice/d10": createDiceTable(10),
			"Dice/d12": createDiceTable(12),
			"Dice/d20": createDiceTable(20),
			"Dice/d100": createDiceTable(100),
		},
	});

	game.settings.register(__ID__, `data`, {
		scope: `user`,
		type: Object,
		config: false,
		requiresReload: false,
	});
};
