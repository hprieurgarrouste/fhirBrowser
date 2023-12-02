import template from "./templates/AppButton.html";

class Button extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    static get observedAttributes() { return ["value"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "value") {
            this._shadow.querySelector('input[type="button"]').value = newValue;
        }
    }
}
window.customElements.define('app-button', Button);