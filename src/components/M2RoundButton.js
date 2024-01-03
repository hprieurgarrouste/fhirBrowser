import template from "./templates/M2RoundButton.html"

class M2RoundButton extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._main = shadow.querySelector("button");
    }

    static get observedAttributes() { return ["data-icon", "disabled"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-icon' === name) {
            this._main.innerText = newValue;
        } else if ('disabled' === name) {
            if (null === newValue) {
                this._main.removeAttribute('disabled');
            } else {
                this._main.setAttribute('disabled', '');
            }
        }
    }

}
customElements.define('m2-round-button', M2RoundButton);
