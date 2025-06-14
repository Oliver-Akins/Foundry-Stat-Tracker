/**
 * A helper function to try and infer what roll mode was used when creating a
 * chat message in case the roll mode was not provided during the createChatMessage
 * hook for whatever reason.
 *
 * **Disclaimer**: This inference is not totally correct. Particularly when inferring
 * a GM's message, as it won't be able to distinguish between a self-roll and a
 * private GM roll when it's
 *
 * @param {ChatMessage} message The ChatMessage document to infer from
 * @returns The Foundry-specified roll mode
 */
export function inferRollMode(message) {
	const whisperCount = message.whisper.length;
	if (whisperCount === 0) {
		return CONST.DICE_ROLL_MODES.PUBLIC;
	};

	if (whisperCount === 1 && message.whisper[0] === game.user.id) {
		return CONST.DICE_ROLL_MODES.SELF;
	};

	let allGMs = true;
	for (const userID of message.whisper) {
		const user = game.users.get(userID);
		if (!user) { continue };
		allGMs &&= user.isGM;
	};

	if (!allGMs) {
		return CONST.DICE_ROLL_MODES.PUBLIC;
	};
	return message.blind
		? CONST.DICE_ROLL_MODES.BLIND
		: CONST.DICE_ROLL_MODES.PRIVATE;
};
