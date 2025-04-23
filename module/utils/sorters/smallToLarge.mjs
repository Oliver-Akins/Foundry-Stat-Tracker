/**
 *
 * @param {string | number} a
 * @param {string | number} b
 */
export function smallToLarge(a, b) {
	const aInt = Number.parseInt(a);
	const bInt = Number.parseInt(b);

	const aIsInvalid = Number.isNaN(aInt);
	const bIsInvalid = Number.isNaN(bInt);
	if (aIsInvalid && bIsInvalid) {
		return a > b;
	} else if (aIsInvalid || bIsInvalid) {
		return aIsInvalid ? -1 : 1;
	};

	return Math.sign(aInt - bInt);
};
