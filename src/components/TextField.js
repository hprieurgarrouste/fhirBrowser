import template from "./templates/TextField.html";

class TextField extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._label = '';
    }
    static get observedAttributes() { return ["placeholder", "readonly", "required", "value"]; }
    attributeChangedCallback(name, oldValue, newValue) {
        const text = this._shadow.querySelector('input[type="text"]');
        switch (name) {
            case "placeholder":
                this._label = newValue;
                break;
            case "readonly":
                if (newValue == null) {
                    text.removeAttribute('readonly');
                } else {
                    text.setAttribute('readonly', '');
                }
                break;
            case "required":
                if (newValue == null) {
                    text.removeAttribute('required');
                } else {
                    text.setAttribute('required', '');
                }
                break;
            case "value":
                text.setAttribute('value', newValue);
                break;
        }
        const isRequired = text.hasAttribute('required');
        const label = this._label + (isRequired ? " *" : "");
        text.setAttribute('placeholder', label);
        this._shadow.querySelector("label").innerText = label;
    }
};
window.customElements.define('text-field', TextField);

