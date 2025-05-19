import { determinePrivacyFromRollMode } from "../utils/privacy.mjs";

Hooks.on(`preCreateChatMessage`, (_message, context, options, author) => {
	const isNew = options.action === `create`;
	const hasRolls = context.rolls?.length > 0;
	const autoTracking = game.settings.get(__ID__, `autoTrackRolls`);
	if (!isNew || !hasRolls || !autoTracking) { return };

	/** An object of dice denomination to rows to add */
	const rows = {};

	const privacy = determinePrivacyFromRollMode(options.rollMode);
	for (const roll of context.rolls) {
		for (const die of roll.dice) {
			const size = die.denomination;
			rows[size] ??= [];
			for (const result of die.results) {
				rows[size].push({ privacy, value: result.result });
			};
		};
	};

	for (const denomination in rows) {
		CONFIG.stats.db.createRows(
			`Dice/${denomination}`,
			author,
			rows[denomination],
		);
	};
});
