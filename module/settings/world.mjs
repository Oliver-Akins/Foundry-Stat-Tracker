/*
World Settings:
	- Track rolls automatically
	- Track inactive rolls (e.g. the "lower" in a "kh" roll)
	- Track self rolls (defaulta false)
*/

export function registerWorldSettings() {
	game.settings.register(__ID__, `autoTrackRolls`, {
		name: `Roll Auto-Tracking`,
		hint: `Whether or not the module should automatically add rolls made in the chat to the database. This is useful if the system you're using has implemented an integration with the module, or if you only want macros to handle the database additions.`,
		scope: `world`,
		type: Boolean,
		config: true,
		default: true,
		requiresReload: true,
	});
};
