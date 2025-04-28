const { HTMLMultiSelectElement } = foundry.applications.elements;

export class CustomMultiSelect extends HTMLMultiSelectElement {
	static tagName = `stats-tracker-multi-select`;

	get placeholder() {
		return this.getAttribute(`placeholder`);
	};

	_buildElements() {
		const [ tags, select ] = super._buildElements();

		const label = document.createElement(`div`);
		label.ariaHidden = true;
		label.innerHTML = game.i18n.localize(this.placeholder);

		select.ariaLabel = game.i18n.localize(this.placeholder);

		return [ label, tags, select ];
	};
};
