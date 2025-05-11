// Apps
import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TableCreator } from "./Apps/TableCreator.mjs";
import { TableManager } from "./Apps/TableManager.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

// Utils
import { validateBucketConfig, validateValue } from "./utils/buckets.mjs";
import { filterPrivateRows } from "./utils/privacy.mjs";

const { deepFreeze } = foundry.utils;

Object.defineProperty(
	globalThis,
	`stats`,
	{
		value: deepFreeze({
			Apps: {
				TestApp,
				StatsViewer,
				TableCreator,
				TableManager,
			},
			utils: {
				filterPrivateRows,
				validateValue,
				validateBucketConfig,
			},
		}),
		writable: false,
	},
);
