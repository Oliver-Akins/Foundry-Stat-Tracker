import { readFile } from "fs/promises";
import { join } from "path";
import { extractPack } from "@foundryvtt/foundryvtt-cli";

export async function extractCompendia() {
	const manifest = JSON.parse(await readFile(`./public/module.json`, `utf-8`));

	if (!manifest.packs || manifest.packs.length === 0) {
		console.log(`No compendium packs defined`);
		process.exit(0);
	};
	console.log(`Extracting compendia`);

	for (const compendium of manifest.packs) {
		console.debug(`Unpacking ${compendium.label} (${compendium.name})`);
		let src = join(process.cwd(), compendium.path, `_source`);
		await extractPack(
			join(process.cwd(), compendium.path),
			src,
			{ recursive: true },
		);
		console.debug(`Finished packing ${compendium.name}`);
	};

	console.log(`Finished unpacking compendia`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	extractCompendia();
};
