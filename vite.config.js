/* eslint-disable no-undef */

import { defineConfig } from "vite";
import { glob } from "glob";
import path from "path";
import { readFileSync } from "fs";

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

// MARK: config
export default defineConfig(({ mode }) => {
	const isProd = mode === `prod`;

	const plugins = [];

	if (!isProd) {
		plugins.push(
			watcher(
				`./public/module.json`,
			),
			fileMarkerPlugin(),
		);
	};

	const manifest = JSON.parse(readFileSync(`./public/module.json`, `utf-8`));

	return {
		plugins,
		define: {
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
			watch: {
				include: [
					`module/**`,
					`public/**`,
				],
				// skipWrite: false,
				// onInvalidate: console.log
			},
			outDir: `${mode}.dist`,
			emptyOutDir: true,
		},
	};
});

/* eslint-enable no-undef */
