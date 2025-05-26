export function registerUserSettings() {
	game.settings.register(__ID__, `statsSidebarTab`, {
		name: `STAT_TRACKER.settings.statsSidebarTab.name`,
		hint: `STAT_TRACKER.settings.statsSidebarTab.hint`,
		scope: `user`,
		type: Boolean,
		config: true,
		default: true,
		requiresReload: true,
	});
};
