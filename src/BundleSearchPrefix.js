import template from "./templates/BundleSearchPrefix.html";

class BundleSearchPrefix extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    get value() {
        return this._shadow.querySelector("input").value;
    }
    set value(newValue) {
        this._shadow.querySelector("input").value = newValue;
    }
};
customElements.define('bundle-search-prefix', BundleSearchPrefix);