export function registerMetaSettings() {
	game.settings.register(__ID__, `tables`, {
		scope: `world`,
		type: Array,
		config: false,
		requiresReload: false,
	});

	game.settings.register(__ID__, `data`, {
		scope: `user`,
		type: Object,
		config: false,
		requiresReload: false,
	});
};
