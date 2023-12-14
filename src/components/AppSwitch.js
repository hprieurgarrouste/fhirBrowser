import template from "./templates/AppSwitch.html";

class AppSwitch extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
        this._input = null;
    }

    static get observedAttributes() { return ['data-checked']; }

    attributeChangedCallback(name, oldValue, newValue) {
        const input = this._shadow.querySelector('input');
        if ('data-checked' == name) {
            if (null === newValue) {
                input.removeAttribute('checked');
            } else {
                input.setAttribute('checked', "");
            }
        }
    }

    connectedCallback() {
        this._input = this._shadow.querySelector('input');
        this._shadow.addEventListener('click', this.onclickHandler);
    }

    onclickHandler = (event) => {
        if (this.hasAttribute('data-checked')) {
            this.removeAttribute('data-checked');
        } else {
            this.setAttribute('data-checked', '');
        }
    }
}
window.customElements.define('app-switch', AppSwitch);