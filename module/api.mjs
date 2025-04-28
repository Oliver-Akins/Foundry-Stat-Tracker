// Apps
import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

// Utils
import { filterPrivateRows } from "./utils/filterPrivateRows.mjs";
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
			},
			utils: {
				filterPrivateRows,
				validateValue,
			},
		}),
		writable: false,
	},
);
