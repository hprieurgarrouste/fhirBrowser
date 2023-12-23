import template from "./templates/AppSwitch.html";

class AppSwitch extends HTMLElement {

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
        this._main = null;
    }

    static get observedAttributes() { return ['data-checked']; }

    attributeChangedCallback(name, oldValue, newValue) {
        const main = this._shadow.querySelector('main');
        if ('data-checked' == name) {
            if (null === newValue) {
                main.classList.remove('checked');
            } else {
                main.classList.add('checked');
            }
        }
    }

    connectedCallback() {
        this._shadow.addEventListener('click', this.clickHandler);
    }

    clickHandler = (event) => {
        if (this.hasAttribute('data-checked')) {
            this.removeAttribute('data-checked');
        } else {
            this.setAttribute('data-checked', '');
        }
    }
}
window.customElements.define('app-switch', AppSwitch);