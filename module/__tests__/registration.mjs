import { barGraphTests } from "./schemas/barGraph.mjs";
import { numberBucketTests } from "./schemas/numberBucket.mjs";
import { stringBucketTests } from "./schemas/stringBucket.mjs";

Hooks.on(`quenchReady`, (quench) => {
	numberBucketTests(quench);
	stringBucketTests(quench);
	barGraphTests(quench);
});
