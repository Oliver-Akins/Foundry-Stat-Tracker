// Apps
import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TableCreator } from "./Apps/TableCreator.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

// Utils
import { filterPrivateRows } from "./utils/privacy.mjs";
import { validateValue } from "./utils/validateValue.mjs";

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
			},
			utils: {
				filterPrivateRows,
				validateValue,
			},
		}),
		writable: false,
	},
);
