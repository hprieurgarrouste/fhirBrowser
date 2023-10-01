import template from "./templates/TextField.html";

class TextField extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    static get observedAttributes() { return ["placeholder"]; }
    attributeChangedCallback(name, oldValue, newValue) {
        if ("placeholder" === name) {
            this._shadow.querySelector('input[type="text"]').setAttribute('placeholder', newValue);
            this._shadow.querySelector("label").innerText = newValue;
        }
    }
};
window.customElements.define('text-field', TextField);

