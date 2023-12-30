import template from "./templates/BundleSearchText.html";

class BundleSearchText extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._input = shadow.querySelector('input');
    }

    static get observedAttributes() { return ['placeholder']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('placeholder' == name) {
            this._input.setAttribute('placeholder', newValue);
        }
    }

    get value() {
        return this._input.value;
    }
    set value(newValue) {
        this._input.value = newValue;
    }

};
customElements.define('bundle-search-text', BundleSearchText)
