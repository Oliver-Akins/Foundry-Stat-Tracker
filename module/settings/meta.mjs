export function registerMetaSettings() {
	game.settings.register(__ID__, `data`, {
		scope: `user`,
		type: Object,
		config: false,
		requiresReload: false,
	});
};
