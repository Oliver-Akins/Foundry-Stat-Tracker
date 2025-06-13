export const PrivacyMode = Object.freeze({
	/** Only the GM is able to the see the result of the row */
	GM: `gm`,
	/** Both the GM and the logged in user are able to see the row */
	PRIVATE: `private`,
	/** Only the logged in user is able to see the row */
	SELF: `self`,
	/** Everyone is able to see the row */
	PUBLIC: `public`,
});

export function determinePrivacyFromRollMode(rollMode) {
	switch (rollMode) {
		case CONST.DICE_ROLL_MODES.PUBLIC:
			return PrivacyMode.PUBLIC;
		case CONST.DICE_ROLL_MODES.BLIND:
			return PrivacyMode.GM;
		case CONST.DICE_ROLL_MODES.PRIVATE:
			return PrivacyMode.PRIVATE;
		case CONST.DICE_ROLL_MODES.SELF:
			return PrivacyMode.SELF;
	}
	return PrivacyMode.SELF;
};

/**
 * Filters an array of database rows based on if the current user would
 * be able to see them based on the privacy level.
 *
 * @param {Array<any>} rows The rows to filter
 * @param {string} userID The user's ID who the rows belong to
 * @param {(PrivacyMode[keyof PrivacyMode])[]} privacies The privacy level we're filtering for
 * @returns The filtered rows
 */
export function filterPrivateRows(rows, userID, privacies) {
	const filtered = [];

	const isMe = userID === game.user.id;
	const isGM = game.user.isGM;

	for (const row of rows) {
		let allowed = privacies.includes(row.privacy);

		/*
		Assert that the user is actually allowed to see the privacy level, even if
		they provide through the param that they want that privacy level.
		*/
		switch (row.privacy) {
			case PrivacyMode.SELF: {
				allowed &&= isMe;
				break;
			};
			case PrivacyMode.GM: {
				allowed &&= isGM;
				break;
			};
			case PrivacyMode.PRIVATE: {
				allowed &&= (isMe || isGM);
				break;
			};
		};

		if (allowed) {
			filtered.push(row);
		};
	};

	return filtered;
};
