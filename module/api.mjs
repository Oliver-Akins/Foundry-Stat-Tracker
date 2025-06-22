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
import { barGraphSchema, numberBucketSchema, rowSchema, stringBucketSchema, tableSchema } from "./utils/databases/model.mjs";
import { determinePrivacyFromRollMode, filterPrivateRows, PrivacyMode } from "./utils/privacy.mjs";
import { validateBucketConfig, validateValue } from "./utils/buckets.mjs";
import { inferRollMode } from "./utils/inferRollMode.mjs";

const { deepFreeze } = foundry.utils;

export const api = deepFreeze({
	Apps: {
		TestApp,
		StatsViewer,
		TableCreator,
		TableManager,
	},
	utils: {
		determinePrivacyFromRollMode,
		inferRollMode,
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
	schemas: {
		buckets: {
			number: numberBucketSchema,
			string: stringBucketSchema,
		},
		graphs: {
			bar: barGraphSchema,
		},
		table: tableSchema,
		row: rowSchema,
	},
});
