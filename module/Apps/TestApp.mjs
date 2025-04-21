import Chart from "chart.js/auto";
import { filePath } from "../consts.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const data = [
	{ face: 1, count: Math.floor(Math.random() * 50) },
	{ face: 2, count: Math.floor(Math.random() * 50) },
	{ face: 3, count: Math.floor(Math.random() * 50) },
	{ face: 4, count: Math.floor(Math.random() * 50) },
	{ face: 5, count: Math.floor(Math.random() * 50) },
	{ face: 6, count: Math.floor(Math.random() * 50) },
];

export class TestApp extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		window: {
			title: `Dice Pool`,
			frame: true,
			positioned: true,
			resizable: false,
			minimizable: true,
		},
		position: {
			width: `auto`,
			height: `auto`,
		},
		actions: {
		},
	};

	static PARTS = {
		numberOfDice: {
			template: filePath(`templates/Apps/TestApp/main.hbs`),
		},
	};
	// #endregion

	_onRender() {
		const canvas = this.element.querySelector(`canvas`);
		new Chart(
			canvas,
			{
				type: `bar`,
				data: {
					labels: data.map( r => r.face),
					datasets: [
						{
							label: `d6 Rolls`,
							data: data.map(r => r.count),
						},
					],
				},
			},
		);
	};
};
