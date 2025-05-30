/*
World Settings:
	- Track inactive rolls (e.g. the "lower" in a "kh" roll)
*/

export function registerWorldSettings() {
	game.settings.register(__ID__, `autoTrackRolls`, {
		name: `STAT_TRACKER.settings.autoTrackRolls.name`,
		hint: `STAT_TRACKER.settings.autoTrackRolls.hint`,
		scope: `world`,
		type: Boolean,
		config: true,
		default: true,
		requiresReload: false,
	});

	game.settings.register(__ID__, `globalAPI`, {
		name: `STAT_TRACKER.settings.globalAPI.name`,
		hint: `STAT_TRACKER.settings.globalAPI.hint`,
		scope: `world`,
		type: Boolean,
		config: true,
		default: import.meta.env.DEV,
		requiresReload: true,
	});
};
