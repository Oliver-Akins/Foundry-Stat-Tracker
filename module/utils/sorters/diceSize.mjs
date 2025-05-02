export function diceSizeSorter(a, b) {
	const aInt = Number(a.slice(1));
	const bInt = Number(b.slice(1));
	return Math.sign(aInt - bInt);
};
