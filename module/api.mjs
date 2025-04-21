import { StatsViewer } from "./Apps/StatsViewer.mjs";
import { TestApp } from "./Apps/TestApp.mjs";

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
		}),
		writable: false,
	},
);
