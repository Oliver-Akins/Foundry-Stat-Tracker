import { determinePrivacyFromRollMode } from "../utils/privacy.mjs";
import { inferRollMode } from "../utils/inferRollMode.mjs";

Hooks.on(`createChatMessage`, (message, options, author) => {
	console.log({ message, options, author});
	const isSelf = author === game.user.id;
	const isNew = options.action === `create`;
	const hasRolls = message.rolls?.length > 0;
	const autoTracking = game.settings.get(__ID__, `autoTrackRolls`);
	if (!isSelf || !isNew || !hasRolls || !autoTracking) { return };

	/** An object of dice denomination to database rows */
	const rows = {};

	const privacy = determinePrivacyFromRollMode(options.rollMode ?? inferRollMode(message));

	/*
	Goes through all of the dice within the message and grabs their result in order
	to batch-save them all to the database handler.
	*/
	for (const roll of message.rolls) {
		for (const die of roll.dice) {
			const size = die.denomination;
			rows[size] ??= [];
			for (const result of die.results) {
				rows[size].push({ privacy, value: result.result });
			};
		};
	};

	// save all the rows, then rerender once we're properly done
	for (const denomination in rows) {
		CONFIG.stats.db.createRows(
			`Dice/${denomination}`,
			author,
			rows[denomination],
			{ rerender: false },
		);
	};
	CONFIG.stats.db.render({ userUpdated: author });
});
