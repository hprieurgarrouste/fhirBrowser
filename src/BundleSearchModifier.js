import template from "./templates/BundleSearchModifier.html";

class BundleSearchModifier extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._input = shadow.querySelector('input');
    }

    get value() {
        return this._input.value;
    }
    set value(newValue) {
        this._input.value = newValue;
    }

};
customElements.define('bundle-search-modifier', BundleSearchModifier)
