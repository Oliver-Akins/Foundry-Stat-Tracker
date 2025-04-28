/**
 * Filters an array of database rows based on if the current user would
 * be able to see them based on the privacy level.
 *
 * @param {Array<any>} rows The rows to filter
 * @param {string} userID The user's ID who the rows belong to
 * @param {"all"|"me"|"none"} privacy The privacy level we're filtering for
 * @returns The filtered rows
 */
export function filterPrivateRows(rows, userID, privacy) {
	console.log(rows, userID, privacy);
	const filtered = [];

	const isMe = userID === game.user.id;
	// TODO: make this use a permission rather than just isGM
	const canSeeAll = game.user.isGM;

	for (const row of rows) {

		let allowed = !row.isPrivate;
		allowed ||= privacy === `all` && canSeeAll;
		allowed ||= privacy === `my` && isMe;

		if (allowed) {
			filtered.push(row);
		};
	};

	return filtered;
};
