import { barGraphTests } from "./schemas/barGraph.mjs";
import { numberBucketTests } from "./schemas/numberBucket.mjs";
import { rowTests } from "./schemas/row.mjs";
import { stringBucketTests } from "./schemas/stringBucket.mjs";
import { tableTests } from "./schemas/table.mjs";

Hooks.on(`quenchReady`, (quench) => {
	numberBucketTests(quench);
	stringBucketTests(quench);
	barGraphTests(quench);
	tableTests(quench);
	rowTests(quench);
});
