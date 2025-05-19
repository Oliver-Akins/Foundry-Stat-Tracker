// Apps
import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TableCreator } from "./Apps/TableCreator.mjs";
import { TableManager } from "./Apps/TableManager.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

// Utils
import { filterPrivateRows, PrivacyMode } from "./utils/privacy.mjs";
import { validateBucketConfig, validateValue } from "./utils/buckets.mjs";

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
			enums: {
				PrivacyMode,
			},
		}),
		writable: false,
	},
);
