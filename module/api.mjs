// Apps
import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TableCreator } from "./Apps/TableCreator.mjs";
import { TableManager } from "./Apps/TableManager.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

// Databases
import { Database } from "./utils/databases/Database.mjs";
import { MemoryDatabase } from "./utils/databases/Memory.mjs";
import { UserFlagDatabase } from "./utils/databases/UserFlag.mjs";

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
			databases: {
				Database,
				MemoryDatabase,
				UserFlagDatabase,
			},
		}),
		writable: false,
	},
);
