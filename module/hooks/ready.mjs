import { Logger } from "../utils/Logger.mjs";

Hooks.on(`ready`, () => {
	Logger.log(`Version: ${__VERSION__}`);
});
