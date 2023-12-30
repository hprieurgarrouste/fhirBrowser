import template from "./templates/AppButton.html";

class Button extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._input = shadow.querySelector('input[type="button"]');
    }

    static get observedAttributes() { return ['value', 'disabled']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'value') {
            this._input.value = newValue;
        } else if (name == 'disabled') {
            if (null === newValue) {
                this._input.removeAttribute('disabled');
            } else {
                this._input.setAttribute('disabled', '');
            }
        }
    }
}
window.customElements.define('app-button', Button);