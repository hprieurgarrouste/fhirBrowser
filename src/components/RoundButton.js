import template from "./templates/RoundButton.html";

class RoundButton extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        shadow.addEventListener('click', this._onClick);
        this._main = shadow.querySelector("main");
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

    _onClick(event) {
        if (event.target.hasAttribute('disabled')) {
            event.stopPropagation();
        }
    }
}
customElements.define('round-button', RoundButton);
