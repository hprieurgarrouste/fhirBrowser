import template from "./templates/AppButton.html";

class Button extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    static get observedAttributes() { return ['value', 'disabled']; }

    attributeChangedCallback(name, oldValue, newValue) {
        const input = this._shadow.querySelector('input[type="button"]');
        if (name == 'value') {
            input.value = newValue;
        } else if (name == 'disabled') {
            if (null === newValue) {
                input.removeAttribute('disabled');
            } else {
                input.setAttribute('disabled', '');
            }
        }
    }
}
window.customElements.define('app-button', Button);