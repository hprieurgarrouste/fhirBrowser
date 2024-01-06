import template from "./templates/BundleSearchPrefix.html";

export default class BundleSearchPrefix extends HTMLElement {
    /** @type {HTMLInputElement} */
    #input;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this.#input = shadow.querySelector('input');
    }

    get value() {
        return this.#input.value;
    }
    set value(newValue) {
        this.#input.value = newValue;
    }
};
customElements.define('bundle-search-prefix', BundleSearchPrefix);
