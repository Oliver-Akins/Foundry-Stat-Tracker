import { barGraphTests } from "./schemas/barGraph.test.mjs";
import { numberBucketTests } from "./schemas/numberBucket.test.mjs";
import { rowTests } from "./schemas/row.test.mjs";
import { stringBucketTests } from "./schemas/stringBucket.test.mjs";
import { tableTests } from "./schemas/table.test.mjs";

Hooks.on(`quenchReady`, (quench) => {
	numberBucketTests(quench);
	stringBucketTests(quench);
	barGraphTests(quench);
	tableTests(quench);
	rowTests(quench);
});
