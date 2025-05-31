/* eslint-disable no-undef */

import { cp, rm } from "fs/promises";
import { readFileSync, symlinkSync } from "fs";
import { buildCompendia } from "./scripts/buildCompendia.mjs";
import { defineConfig } from "vite";
import { glob } from "glob";
import path from "path";

// MARK: custom plugins
function fileMarkerPlugin() {
	return {
		name: `file-marker-plugin`,

		transform(code, id) {
			const basePath = __dirname;
			const relative = path.relative(basePath, id);

			const comment = `/*! --- ${relative} --- */\n`;
			return {
				code: comment + code,
				map: null,
			};
		},
	};
};

/*
The intent of this plugin is to make so that Rollup watches files
that are not in the module graph (i.e. not imported in a JS file),
allowing for rebuilds when the module's manifest changes, or when
handlebars is updated.
*/
function watcher(...globs) {
	return {
		buildStart() {
			for (const item of globs) {
				glob.sync(path.resolve(item)).forEach((filename) => {
					this.addWatchFile(filename);
				});
			}
		},
	};
};

/*
The intent of this plugin is to handle the symlinking of the compendium packs
so that they can modified during dev without needing to worry about the rebuild
destroying the in-progress compendia data.
*/
function symlinkPacks() {
	return {
		writeBundle(options) {
			symlinkSync(
				path.resolve(__dirname, `packs`),
				`${options.dir}/packs`,
				`dir`,
			);
		},
	};
};

/*
The intent of this plugin is to handle the copying, cleaning and compiling of
compendia packs for production
*/
function buildPacks() {
	return {
		async writeBundle(options) {
			const buildDir = options.dir;
			await buildCompendia();
			await cp(`${__dirname}/packs`, `${buildDir}/packs`, { recursive: true, force: true });
			for (const file of glob.sync(`${buildDir}/packs/**/_source/`)) {
				await rm(file, { recursive: true, force: true });
			};
		},
	};
};

/*
Allows copying a file from somewhere into the build directory once the build has
completed.
*/
function copyFile(filepath, targetPath) {
	return {
		async writeBundle(options) {
			const buildDir = options.dir;
			await cp(filepath, `${buildDir}/${targetPath}`);
		},
	};
};

// MARK: config
export default defineConfig(({ mode }) => {
	const isProd = mode === `prod`;

	const plugins = [
		copyFile(`LICENSE`, `LICENSE`),
		copyFile(`README.md`, `README.md`),
	];

	if (isProd) {
		plugins.push(
			buildPacks(),
		);
	} else {
		plugins.push(
			symlinkPacks(),
			watcher(
				`./public`,
			),
			fileMarkerPlugin(),
		);
	};

	const manifest = JSON.parse(readFileSync(`./public/module.json`, `utf-8`));

	return {
		plugins,
		define: {
			__TITLE__: JSON.stringify(manifest.title),
			__ID__: JSON.stringify(manifest.id),
			__VERSION__: JSON.stringify(manifest.version),
		},
		mode: isProd ? `production` : `development`,
		build: {
			minify: isProd ? `terser` : false,
			sourcemap: true,
			rollupOptions: {
				input: {
					module: `./module/main.mjs`,
					// TODO: Figure out how to get handlebars files being used here
				},
				output: {
					entryFileNames: `[name].mjs`,
					format: `esm`,
				},
			},
			outDir: `${mode}.dist`,
			emptyOutDir: true,
		},
	};
});

/* eslint-enable no-undef */
