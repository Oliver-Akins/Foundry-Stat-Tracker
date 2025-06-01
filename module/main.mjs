import "./api.mjs";

// Lifecycle Hooks
import "./hooks/init.mjs";
import "./hooks/ready.mjs";

// Document Hooks
import "./hooks/preCreateChatMessage.mjs";

// Dev Only imports
import "./__tests__/registration.mjs";
// if (import.meta.env.DEV) {
// 	import(`./__tests__/registration.mjs`);
// }
