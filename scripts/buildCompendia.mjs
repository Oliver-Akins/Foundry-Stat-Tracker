import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { pathToFileURL } from "url";

export async function buildCompendia() {
	const manifest = JSON.parse(await readFile(`./public/module.json`, `utf-8`));

	if (!manifest.packs || manifest.packs.length === 0) {
		console.log(`No compendium packs defined`);
		process.exit(0);
	};
	console.log(`Packing compendia`);

	for (const compendium of manifest.packs) {
		console.debug(`Packing ${compendium.label} (${compendium.name})`);
		let src = join(process.cwd(), compendium.path, `_source`);
		if (!existsSync(src)) {
			console.warn(`${compendium.path} doesn't exist, skipping.`)
			continue;
		};
		await compilePack(
			src,
			join(process.cwd(), compendium.path),
			{ recursive: true },
		);
		console.debug(`Finished packing compendium: ${compendium.name}`);
	};

	console.log(`Finished packing all compendia`)
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	buildCompendia();
};
